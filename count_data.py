#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
統計各月份資料筆數
"""

import pandas as pd
import os

def count_monthly_data():
    months = ['2025-05', '2025-06', '2025-07', '2025-08']
    total_records = 0
    
    print("=== 各月份資料統計 ===")
    
    for month in months:
        file_path = f"data/holdings_{month}.csv"
        if os.path.exists(file_path):
            df = pd.read_csv(file_path)
            record_count = len(df)
            unique_dates = df['日期'].nunique()
            total_records += record_count
            
            print(f"{month}: {record_count:4d} 筆記錄, {unique_dates:2d} 個交易日")
        else:
            print(f"{month}: 檔案不存在")
    
    print(f"\n總計: {total_records} 筆記錄")

if __name__ == "__main__":
    count_monthly_data()
