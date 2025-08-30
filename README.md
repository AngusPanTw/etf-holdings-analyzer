# ETF 持股變化分析器

追蹤野村臺灣智慧優選主動式ETF (00980A) 的每日持股變化，透過視覺化圖表協助投資決策。

## 🌐 線上展示

**網站連結**: https://anguspantw.g### ✅ 第三階段：基礎網頁架構 (已完成)
- [x] 建立HTML檔案結構
- [x] 主頁導航
- [x] 基礎樣式
- [x] 表格展示功能
- [x] 本地伺服器啟動腳本

### ✅ 第四階段：表格功能 (已完成)
- [x] 完整表格版本
- [x] 下拉選單表格版本  
- [x] 表格排序和篩選tf-holdings-analyzer/

## 功能特色

- 📊 **多種圖表展示**：折線圖追蹤個股權重和股數變化
- 📋 **靈活表格檢視**：下拉選單或完整表格模式
- 🎯 **異常偵測**：可調整閾值，快速發現持股異常變化
- 💾 **按月分檔儲存**：高效的資料管理和讀取
- 🔄 **增量更新**：避免重複撈取已有資料

## 專案結構

```
etf-holdings-analyzer/
├── docs/                      # 網頁介面 (GitHub Pages)
│   ├── data/                 # 資料儲存 (按月分檔CSV)
│   │   ├── holdings_2025-05.csv
│   │   ├── holdings_2025-06.csv
│   │   ├── holdings_2025-07.csv
│   │   └── holdings_2025-08.csv
│   ├── assets/               # 靜態資源
│   │   ├── style.css
│   │   ├── script.js
│   │   ├── tables.css
│   │   ├── tables.js
│   │   ├── changes-analysis.js
│   │   └── dropdown.js
│   ├── index.html            # 主頁面
│   ├── table_full.html       # 完整表格
│   ├── table_dropdown.html   # 下拉選單表格
│   ├── stock_changes.html    # 成分股變化分析
│   ├── charts_separate.html  # 分開圖表
│   └── charts_dual_axis.html # 雙軸圖表
├── data/                      # 本地開發資料備份
│   ├── holdings_2025-05.csv
│   ├── holdings_2025-06.csv
│   ├── holdings_2025-07.csv
│   └── holdings_2025-08.csv
├── data_collector.py          # 資料收集腳本 ✅
├── test_collector.py          # 測試腳本
├── count_data.py             # 資料統計腳本
├── start_server.py           # 本地伺服器啟動腳本
├── 啟動.bat                  # Windows 快速啟動腳本
├── requirements.txt           # Python 相依套件
├── DEVELOPMENT_NOTES.md       # 開發筆記
└── README.md                 # 專案說明
```

## 快速開始

### 1. 安裝相依套件
```bash
pip install -r requirements.txt
```

### 2. 收集資料
```bash
# 收集完整資料 (2025-05-02 至今)
python data_collector.py

# 測試單日資料收集
python test_collector.py

# 統計資料筆數
python count_data.py
```

### 3. 開啟網頁
```bash
# 本地開發伺服器
python start_server.py

# 或使用 Windows 快速啟動
./啟動.bat

# 線上版本
# 直接訪問: https://anguspantw.github.io/etf-holdings-analyzer/
```

## 資料來源

- **API**: `https://www.nomurafunds.com.tw/API/ETFAPI/api/Fund/GetFundAssets`
- **目標ETF**: 00980A (野村臺灣智慧優選主動式ETF)
- **資料範圍**: 2025-05-02 至今
- **資料格式**: CSV，按日期和權重排序

## 資料統計 (截至 2025-08-30)

| 月份 | 記錄數 | 交易日 |
|------|--------|--------|
| 2025-05 | 1,077 | 20 |
| 2025-06 | 1,071 | 21 |
| 2025-07 | 1,216 | 23 |
| 2025-08 | 1,092 | 21 |
| **總計** | **4,456** | **85** |

## 開發進度

### ✅ 第一階段：資料收集 (已完成)
- [x] 專案架構設計
- [x] 資料收集腳本
- [x] 按月分檔儲存
- [x] 雙重排序 (日期 + 權重)
- [x] 工作日篩選
- [x] 錯誤處理和延遲機制

### ✅ 第二階段：成分股變化分析 (已完成)
- [x] 精確的日過日變化分析算法
- [x] 智慧型月份選擇器與預覽統計
- [x] 詳細的調試日誌系統
- [x] 完整的分析結果展示

### � 第三階段：基礎網頁架構 (進行中)
- [x] 建立HTML檔案結構
- [x] 主頁導航
- [x] 基礎樣式
- [x] 表格展示功能

### �📋 第四階段：表格功能 (已完成)
- [x] 完整表格版本
- [x] 下拉選單表格版本  
- [x] 表格排序和篩選

### 📊 第五階段：圖表功能 (待開發)
- [ ] 引入圖表函式庫 (Chart.js)
- [ ] 分開圖表版本
- [ ] 雙Y軸圖表版本

### 🎯 第六階段：進階功能 (待開發)
- [ ] 異常偵測和閾值控制項
- [ ] 效能最佳化和使用者體驗

## 注意事項

- API 每次請求間隔 1 秒，避免過度頻繁呼叫
- 只收集工作日資料 (週一至週五)
- 資料按月分檔，便於管理和讀取
- 支援增量更新，避免重複撷取已有資料
- CSV 檔案按日期和權重雙重排序

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License