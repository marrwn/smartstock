import pandas as pd
import holidays
from io import StringIO, BytesIO

class DataPipelineError(Exception):
    """Custom exception raised when data pipeline validation or parsing fails."""
    pass

def process_sales_data(source):
    """
    Processes sales CSV data from a URL, file path, string, or file-like object.
    
    Expected columns: date, product, quantity, price (category optional)
    Adds derived columns: revenue, day_of_week, is_weekend, is_holiday
    """
    try:
        if isinstance(source, str):
            if source.startswith("http://") or source.startswith("https://"):
                df = pd.read_csv(source)
            else:
                df = pd.read_csv(source)
        elif isinstance(source, (bytes, bytearray)):
            df = pd.read_csv(BytesIO(source))
        elif hasattr(source, "read"):
            df = pd.read_csv(source)
        elif isinstance(source, pd.DataFrame):
            df = source.copy()
        else:
            raise DataPipelineError("Unsupported source format for sales data.")
    except Exception as e:
        if isinstance(e, DataPipelineError):
            raise e
        raise DataPipelineError(f"Failed to read CSV input: {str(e)}")

    if df.empty:
        raise DataPipelineError("The provided dataset is empty.")

    # Normalize column names
    df.columns = [str(col).strip().lower() for col in df.columns]
    
    required_cols = {"date", "product", "quantity", "price"}
    missing_cols = required_cols - set(df.columns)
    if missing_cols:
        raise DataPipelineError(f"Dataset is missing required columns: {', '.join(sorted(missing_cols))}")

    try:
        df["date"] = pd.to_datetime(df["date"])
    except Exception as e:
        raise DataPipelineError(f"Failed to parse 'date' column: {str(e)}")

    df["product"] = df["product"].astype(str).str.strip()
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(0)
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0.0)

    # Compute revenue
    df["revenue"] = df["quantity"] * df["price"]

    # Extract time features
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].apply(lambda d: 1 if d >= 5 else 0)

    # Add holiday detection (US holidays)
    min_year = df["date"].dt.year.min()
    max_year = df["date"].dt.year.max()
    us_holidays = holidays.US(years=list(range(min_year, max_year + 1)))

    df["is_holiday"] = df["date"].dt.date.apply(lambda d: 1 if d in us_holidays else 0)

    return df
