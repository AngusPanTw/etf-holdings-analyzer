#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試腳本：撷取單一日期的資料進行驗證
"""

from data_collector import ETFDataCollector

def test_single_day():
    collector = ETFDataCollector()
    
    print("=== 測試單日資料撷取 ===")
    
    # 測試撷取昨天的資料
    test_date = "2025-08-29"  # 可以調整為最近的工作日
    
    collector.collect_all_data(start_date=test_date, end_date=test_date)

if __name__ == "__main__":
    test_single_day()
