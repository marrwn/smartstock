import pandas as pd
import numpy as np
import holidays
from datetime import datetime, timedelta
import os

def generate_synthetic_data(output_path="synthetic_sales.csv", days=90):
    np.random.seed(42)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days - 1)
    
    us_holidays = holidays.US(years=[start_date.year, end_date.year])
    
    products = [
        {"name": "Widget A", "price": 25.0, "category": "Electronics", "base_qty": 30},
        {"name": "Widget B", "price": 15.0, "category": "Accessories", "base_qty": 50},
        {"name": "Widget C", "price": 45.0, "category": "Gadgets", "base_qty": 20},
        {"name": "Widget D", "price": 80.0, "category": "Hardware", "base_qty": 10},
    ]
    
    records = []
    
    current_date = start_date
    while current_date <= end_date:
        is_weekend = current_date.weekday() >= 5
        is_holiday = current_date in us_holidays
        
        for p in products:
            # Base quantity with noise
            multiplier = 1.0
            if is_weekend:
                multiplier += 0.45  # Weekend spike (~45%)
            if is_holiday:
                multiplier += 0.85  # Holiday spike (~85%)
                
            # Random variation
            noise = np.random.normal(0, 0.15)
            qty = max(0, int(p["base_qty"] * (multiplier + noise)))
            
            records.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "product": p["name"],
                "quantity": qty,
                "price": p["price"],
                "category": p["category"]
            })
            
        current_date += timedelta(days=1)
        
    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} records in {output_path}")
    return df

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_file = os.path.join(script_dir, "synthetic_sales.csv")
    generate_synthetic_data(out_file)
