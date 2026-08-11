import os
import json
import requests
from typing import Optional
from fastapi import FastAPI, Request, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from data_pipeline import process_sales_data, DataPipelineError
from model_engine import DemandForecaster

app = FastAPI(title="SmartStock AI API", version="1.0.0")

# Enable CORS for localhost frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYNTHETIC_CSV_PATH = os.path.join(os.path.dirname(__file__), "synthetic_sales.csv")

class SyncRequest(BaseModel):
    source_url: Optional[str] = None

class ChatRequest(BaseModel):
    prompt: str
    provider: str = "gemini"  # "gemini" or "openai"
    context: Optional[dict] = None

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/sync")
async def sync_data(request: Request):
    source = None
    content_type = request.headers.get("content-type", "")

    # 1. Handle multipart form data (CSV file upload or form source_url)
    if "multipart/form-data" in content_type:
        try:
            form = await request.form()
            file_obj = form.get("file")
            if file_obj and hasattr(file_obj, "read"):
                file_bytes = await file_obj.read()
                if file_bytes:
                    source = file_bytes
            url_val = form.get("source_url")
            if source is None and url_val:
                source = str(url_val).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse form data: {str(e)}")

    # 2. Handle application/json (Google Sheet URL or empty payload)
    else:
        try:
            body = await request.json()
            if isinstance(body, dict):
                url_val = body.get("source_url")
                if url_val and str(url_val).strip():
                    source = str(url_val).strip()
        except Exception:
            pass  # Fallback to synthetic data if body empty

    # 3. Fallback to local synthetic_sales.csv
    if source is None or (isinstance(source, str) and not source.strip()):
        if os.path.exists(SYNTHETIC_CSV_PATH):
            source = SYNTHETIC_CSV_PATH
        else:
            raise HTTPException(
                status_code=400,
                detail="No source_url or file provided and synthetic_sales.csv is missing."
            )

    try:
        df = process_sales_data(source)
    except DataPipelineError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected pipeline error: {str(e)}")

    # Run ML Demand Forecaster
    try:
        forecaster = DemandForecaster()
        forecaster.train(df)
        forecasts = forecaster.forecast_7_days()
        stock_warnings = forecaster.stockout_risk()
        leaderboard = forecaster.model_comparison()

        # Compute KPIs
        total_revenue = float(round(df["revenue"].sum(), 2))
        total_orders = int(len(df))
        forecast_next_7d = int(sum(item["predicted_qty"] for item in forecasts))

        return {
            "kpis": {
                "revenue": total_revenue,
                "orders": total_orders,
                "forecast_next_7d": forecast_next_7d
            },
            "leaderboard": leaderboard,
            "forecasts": forecasts,
            "stock_warnings": stock_warnings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model engine processing failed: {str(e)}")

@app.post("/api/v1/chat")
def chat_with_ai(
    req: ChatRequest,
    x_api_key: Optional[str] = Header(None)
):
    if not x_api_key or not x_api_key.strip():
        raise HTTPException(status_code=401, detail="API key required. Please configure your API key in settings.")

    api_key = x_api_key.strip()
    provider = req.provider.lower()

    # Build prompt context summary
    context_str = ""
    if req.context:
        kpis = req.context.get("kpis", {})
        warnings = req.context.get("stock_warnings", [])
        leaderboard = req.context.get("leaderboard", [])

        context_str = (
            f"\nCURRENT INVENTORY SYSTEM STATE:\n"
            f"- Revenue: ${kpis.get('revenue', 0):,.2f}\n"
            f"- Orders: {kpis.get('orders', 0)}\n"
            f"- 7-Day Forecast Total Units: {kpis.get('forecast_next_7d', 0)}\n"
            f"- Stock Warnings: {json.dumps(warnings)}\n"
            f"- Top AI Model: {leaderboard[0]['model'] if leaderboard else 'N/A'} (MAE: {leaderboard[0]['mae'] if leaderboard else 'N/A'})\n"
        )

    system_instruction = (
        "You are SmartStock AI, a real-time intelligent inventory copilot for small businesses. "
        "Provide direct, helpful, data-driven advice based on the merchant's context and question. Keep responses concise and action-oriented."
    )

    full_user_prompt = f"{system_instruction}\n{context_str}\nMerchant Question: {req.prompt}"

    try:
        if provider == "gemini":
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [{"text": full_user_prompt}]
                }]
            }
            res = requests.post(url, headers=headers, json=payload, timeout=15)

            if res.status_code == 400 or res.status_code == 401 or res.status_code == 403:
                raise HTTPException(status_code=401, detail="Invalid Gemini API key or unauthorized access.")
            elif res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"Gemini API error: {res.text}")

            data = res.json()
            candidates = data.get("candidates", [])
            if candidates and "content" in candidates[0]:
                parts = candidates[0]["content"].get("parts", [])
                if parts:
                    reply = parts[0].get("text", "No response generated.")
                    return {"reply": reply}
            return {"reply": "No content received from Gemini API."}

        elif provider == "openai":
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"{context_str}\nMerchant Question: {req.prompt}"}
                ],
                "max_tokens": 500
            }
            res = requests.post(url, headers=headers, json=payload, timeout=15)

            if res.status_code == 401 or res.status_code == 403:
                raise HTTPException(status_code=401, detail="Invalid OpenAI API key.")
            elif res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"OpenAI API error: {res.text}")

            data = res.json()
            choices = data.get("choices", [])
            if choices:
                reply = choices[0].get("message", {}).get("content", "No response generated.")
                return {"reply": reply}
            return {"reply": "No content received from OpenAI API."}
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with AI provider: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
