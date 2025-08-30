#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ETF 持股資料收集器
從野村基金 API 收集 00980A ETF 的每日持股資料
按月分檔儲存為 CSV 格式
"""

import requests
import pandas as pd
import json
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import time

class ETFDataCollector:
    def __init__(self):
        self.api_url = "https://www.nomurafunds.com.tw/API/ETFAPI/api/Fund/GetFundAssets"
        self.fund_id = "00980A"
        self.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://www.nomurafunds.com.tw',
            'Referer': 'https://www.nomurafunds.com.tw/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.data_dir = "data"
        
    def ensure_data_dir_exists(self):
        """確保資料目錄存在"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
    
    def get_monthly_data_path(self, date):
        """取得指定日期對應的月份資料檔案路徑"""
        year_month = date.strftime("%Y-%m")
        return os.path.join(self.data_dir, f"holdings_{year_month}.csv")
    
    def fetch_daily_data(self, date):
        """撈取指定日期的持股資料"""
        date_str = date.strftime("%Y-%m-%d")
        
        payload = {
            "FundID": self.fund_id,
            "SearchDate": date_str
        }
        
        try:
            print(f"正在撷取 {date_str} 的資料...")
            response = requests.post(
                self.api_url, 
                headers=self.headers, 
                data=json.dumps(payload),
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return self.parse_response_data(data, date_str)
            else:
                print(f"API 呼叫失敗: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"撷取 {date_str} 資料時發生錯誤: {e}")
            return []
    
    def parse_response_data(self, response_data, date_str):
        """解析 API 回應資料"""
        holdings = []
        
        try:
            entries = response_data.get("Entries", {})
            data = entries.get("Data", {})
            tables = data.get("Table", [])
            
            # 尋找股票資料表格
            for table in tables:
                if table.get("TableTitle") == "股票":
                    rows = table.get("Rows", [])
                    
                    for row in rows:
                        if len(row) >= 4:  # 確保有足夠的欄位
                            holding = {
                                "日期": date_str,
                                "股票代號": row[0],
                                "股票名稱": row[1], 
                                "股數": row[2],
                                "權重": row[3]
                            }
                            holdings.append(holding)
                    break
            
            print(f"  成功解析 {len(holdings)} 筆持股資料")
            
        except Exception as e:
            print(f"解析 {date_str} 資料時發生錯誤: {e}")
        
        return holdings
    
    def save_monthly_data(self, holdings_data, month_path):
        """儲存月份資料到 CSV"""
        if not holdings_data:
            return
            
        df = pd.DataFrame(holdings_data)
        
        # 如果檔案已存在，則合併資料
        if os.path.exists(month_path):
            existing_df = pd.read_csv(month_path)
            # 移除重複的日期資料
            existing_df = existing_df[~existing_df['日期'].isin(df['日期'].unique())]
            df = pd.concat([existing_df, df], ignore_index=True)
        
        # 轉換權重為數值進行排序
        df['權重_數值'] = pd.to_numeric(df['權重'], errors='coerce')
        
        # 排序：首先按日期，然後按權重（由高到低）
        df['日期'] = pd.to_datetime(df['日期'])
        df = df.sort_values(['日期', '權重_數值'], ascending=[True, False])
        df['日期'] = df['日期'].dt.strftime('%Y-%m-%d')
        
        # 移除輔助欄位
        df = df.drop('權重_數值', axis=1)
        
        df.to_csv(month_path, index=False, encoding='utf-8-sig')
        print(f"資料已儲存至: {month_path}")
    
    def get_date_range(self, start_date_str="2025-05-02", end_date_str=None):
        """取得日期範圍"""
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        
        if end_date_str is None:
            end_date = datetime.now()
        else:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
        
        dates = []
        current_date = start_date
        
        while current_date <= end_date:
            # 只在工作日收集資料 (週一到週五)
            if current_date.weekday() < 5:
                dates.append(current_date)
            current_date += timedelta(days=1)
        
        return dates
    
    def collect_all_data(self, start_date="2025-05-02", end_date=None):
        """收集所有資料"""
        self.ensure_data_dir_exists()
        
        dates = self.get_date_range(start_date, end_date)
        print(f"準備收集 {len(dates)} 個工作日的資料")
        
        monthly_data = {}  # 按月份分組資料
        
        for i, date in enumerate(dates):
            holdings = self.fetch_daily_data(date)
            
            if holdings:
                year_month = date.strftime("%Y-%m")
                if year_month not in monthly_data:
                    monthly_data[year_month] = []
                monthly_data[year_month].extend(holdings)
            
            # 避免 API 限制，每次請求後稍作延遲
            if i < len(dates) - 1:
                time.sleep(1)
        
        # 儲存各月份資料
        for year_month, data in monthly_data.items():
            month_path = self.get_monthly_data_path(
                datetime.strptime(year_month + "-01", "%Y-%m-%d")
            )
            self.save_monthly_data(data, month_path)
        
        print(f"\n資料收集完成！共收集了 {len(monthly_data)} 個月份的資料")

def main():
    collector = ETFDataCollector()
    
    print("=== ETF 持股資料收集器 ===")
    print(f"目標 ETF: {collector.fund_id}")
    print(f"資料來源: {collector.api_url}")
    print()
    
    # 開始收集資料
    collector.collect_all_data()

if __name__ == "__main__":
    main()
