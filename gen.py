"""
SmartStock AI — Synthetic Data Studio
A Streamlit app for generating configurable synthetic sales data
for testing the SmartStock AI pipeline (data_pipeline.py / model_engine.py).

Run with:
    streamlit run data_studio.py

Not part of the production app — this is a dev/demo tool for producing
realistic synthetic_sales.csv files with full control over every variable
that affects forecasting: seasonality, holidays, trend, noise, stockouts,
and missing data.
"""

import io
from datetime import date, timedelta

import holidays as holidays_lib
import numpy as np
import pandas as pd
import streamlit as st

st.set_page_config(page_title="SmartStock AI — Data Studio", layout="wide")

# ---------------------------------------------------------------------------
# Sidebar — all configuration lives here
# ---------------------------------------------------------------------------
st.sidebar.title("📦 Data Studio")
st.sidebar.caption("Configure and generate synthetic sales data for SmartStock AI")

with st.sidebar.expander("📅 Date Range", expanded=True):
    default_start = date.today() - timedelta(days=90)
    start_date = st.date_input("Start date", value=default_start)
    end_date = st.date_input("End date", value=date.today())
    if start_date >= end_date:
        st.error("Start date must be before end date.")
        st.stop()

with st.sidebar.expander("🏷️ Products & Categories", expanded=True):
    num_products = st.slider("Number of products", 1, 20, 4)
    use_custom_names = st.checkbox("Use custom product names", value=False)
    if use_custom_names:
        custom_names_raw = st.text_area(
            "One product name per line",
            value="Widget A\nWidget B\nWidget C\nWidget D",
            height=100,
        )
        product_names = [n.strip() for n in custom_names_raw.splitlines() if n.strip()]
        num_products = len(product_names) or 1
    else:
        product_names = [f"Product {chr(65 + i)}" for i in range(num_products)]

    category_pool = st.text_input(
        "Category pool (comma-separated, assigned round-robin)",
        value="General, Electronics, Apparel, Home",
    )
    categories = [c.strip() for c in category_pool.split(",") if c.strip()] or ["General"]

with st.sidebar.expander("💵 Pricing", expanded=False):
    price_min, price_max = st.slider(
        "Base price range ($)", 1.0, 500.0, (9.99, 79.99), step=0.5
    )
    price_volatility = st.slider(
        "Price volatility (day-to-day %)", 0.0, 20.0, 2.0, step=0.5,
        help="Small random price fluctuation, simulates promos/discounts",
    )

with st.sidebar.expander("📈 Demand Behavior", expanded=True):
    base_qty_min, base_qty_max = st.slider(
        "Base daily quantity range (units)", 0, 200, (5, 40)
    )
    weekend_multiplier = st.slider(
        "Weekend demand multiplier", 0.5, 4.0, 1.6, step=0.1
    )
    holiday_multiplier = st.slider(
        "Holiday demand multiplier", 0.5, 5.0, 2.2, step=0.1
    )
    holiday_country = st.selectbox(
        "Holiday calendar (country)",
        options=["US", "GB", "CA", "AU", "DE", "FR", "EG", "IN", "JP"],
        index=0,
    )
    trend_type = st.selectbox(
        "Long-term trend", options=["None", "Growing", "Declining"], index=0
    )
    trend_strength = st.slider(
        "Trend strength (% change over full period)",
        0, 200, 30, step=5,
        disabled=(trend_type == "None"),
    )
    noise_level = st.slider(
        "Random noise (std dev, units)", 0.0, 20.0, 4.0, step=0.5
    )

with st.sidebar.expander("🕳️ Data Quality Issues", expanded=False):
    st.caption("Inject realistic messiness — useful for testing data_pipeline.py's cleaning logic")
    missing_rate = st.slider("Missing quantity rate (%)", 0.0, 30.0, 3.0, step=0.5)
    stockout_rate = st.slider(
        "Stockout injection rate (%)", 0.0, 20.0, 4.0, step=0.5,
        help="Random days forced to 0 quantity, simulating the product being out of stock",
    )
    duplicate_rate = st.slider("Duplicate row rate (%)", 0.0, 10.0, 0.0, step=0.5)

with st.sidebar.expander("🎲 Reproducibility", expanded=False):
    seed = st.number_input("Random seed", value=42, step=1)
    st.caption("Same seed + same settings = identical output every time")

st.sidebar.divider()
generate_clicked = st.sidebar.button("🚀 Generate Data", type="primary", use_container_width=True)

# ---------------------------------------------------------------------------
# Main area
# ---------------------------------------------------------------------------
st.title("SmartStock AI — Synthetic Data Studio")
st.caption(
    "Generate configurable synthetic sales data to test the forecasting pipeline. "
    "Adjust every knob in the sidebar, then generate and download a CSV."
)


def generate_data() -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    dates = pd.date_range(start_date, end_date, freq="D")
    n_days = len(dates)

    country_holidays = holidays_lib.country_holidays(holiday_country, years=range(start_date.year, end_date.year + 1))

    rows = []
    for i, product in enumerate(product_names):
        category = categories[i % len(categories)]
        base_price = rng.uniform(price_min, price_max)

        # Trend multiplier across the full date range
        if trend_type == "Growing":
            trend_curve = np.linspace(1.0, 1.0 + trend_strength / 100, n_days)
        elif trend_type == "Declining":
            trend_curve = np.linspace(1.0, max(0.05, 1.0 - trend_strength / 100), n_days)
        else:
            trend_curve = np.ones(n_days)

        base_qty = rng.uniform(base_qty_min, base_qty_max)

        for day_idx, d in enumerate(dates):
            is_weekend = d.weekday() >= 5
            is_holiday = d.date() in country_holidays

            multiplier = trend_curve[day_idx]
            if is_weekend:
                multiplier *= weekend_multiplier
            if is_holiday:
                multiplier *= holiday_multiplier

            noise = rng.normal(0, noise_level)
            quantity = max(0, round(base_qty * multiplier + noise))

            # Data quality issues
            if rng.random() < stockout_rate / 100:
                quantity = 0
            if rng.random() < missing_rate / 100:
                quantity = np.nan

            price = round(base_price * (1 + rng.uniform(-price_volatility, price_volatility) / 100), 2)

            rows.append(
                {
                    "date": d.strftime("%Y-%m-%d"),
                    "product": product,
                    "category": category,
                    "quantity": quantity,
                    "price": price,
                }
            )

    df = pd.DataFrame(rows)

    # Inject duplicate rows
    if duplicate_rate > 0:
        n_dupes = int(len(df) * duplicate_rate / 100)
        if n_dupes > 0:
            dupes = df.sample(n=n_dupes, random_state=seed, replace=True)
            df = pd.concat([df, dupes], ignore_index=True)

    return df.sort_values(["date", "product"]).reset_index(drop=True)


if generate_clicked or "generated_df" in st.session_state:
    if generate_clicked:
        st.session_state["generated_df"] = generate_data()

    df = st.session_state["generated_df"]

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total rows", f"{len(df):,}")
    col2.metric("Products", num_products)
    col3.metric("Date span", f"{(end_date - start_date).days} days")
    col4.metric("Missing values", int(df["quantity"].isna().sum()))

    tab_preview, tab_chart, tab_stats = st.tabs(["📋 Preview", "📊 Chart", "🔍 Stats"])

    with tab_preview:
        st.dataframe(df, use_container_width=True, height=400)

    with tab_chart:
        chart_df = df.dropna(subset=["quantity"]).copy()
        chart_df["date"] = pd.to_datetime(chart_df["date"])
        show_per_product = st.checkbox("Split by product", value=True)
        if show_per_product:
            pivot = chart_df.pivot_table(index="date", columns="product", values="quantity", aggfunc="sum")
            st.line_chart(pivot)
        else:
            daily_total = chart_df.groupby("date")["quantity"].sum()
            st.line_chart(daily_total)

    with tab_stats:
        st.write("**Per-product summary**")
        summary = df.groupby("product").agg(
            total_quantity=("quantity", "sum"),
            avg_price=("price", "mean"),
            missing_days=("quantity", lambda s: s.isna().sum()),
        ).round(2)
        st.dataframe(summary, use_container_width=True)

    st.divider()
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    st.download_button(
        "⬇️ Download synthetic_sales.csv",
        data=csv_buffer.getvalue(),
        file_name="synthetic_sales.csv",
        mime="text/csv",
        type="primary",
        use_container_width=True,
    )
else:
    st.info("👈 Configure your settings in the sidebar, then click **Generate Data** to begin.")
