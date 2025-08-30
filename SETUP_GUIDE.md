# ETF 持股變化分析器

野村臺灣智慧優選主動式ETF (00980A) 持股變化追蹤與分析工具

## 🚀 快速開始

### 方法一：一鍵啟動（推薦）

1. **執行批次檔案**（Windows 用戶）
   ```cmd
   雙擊 啟動.bat
   ```

2. **或使用 Python 腳本**
   ```bash
   python start_server.py
   ```

### 方法二：手動執行

1. **收集最新資料**
   ```bash
   python data_collector.py
   ```

2. **啟動 HTTP 伺服器**
   ```bash
   python -m http.server 8000
   ```

3. **開啟瀏覽器訪問**
   - 主頁面: http://localhost:8000/web/index.html
   - 完整表格: http://localhost:8000/web/table_full.html
   - 個股查詢: http://localhost:8000/web/table_dropdown.html

## 📊 功能特色

- **📈 持股變化追蹤**: 自動收集每日持股資料
- **🔍 智能過濾**: 支援股票代號、名稱、權重範圍篩選
- **📋 完整表格**: 可排序、分頁的完整資料檢視
- **🎯 個股分析**: 單一股票持股變化查詢
- **📱 響應式設計**: 支援手機、平板、桌面裝置

## 📁 專案結構

```
etf-holdings-analyzer/
├── data/                    # CSV 資料檔案
│   ├── holdings_2025-05.csv
│   ├── holdings_2025-06.csv
│   └── ...
├── web/                     # 網頁介面
│   ├── index.html          # 主頁面
│   ├── table_full.html     # 完整表格
│   ├── table_dropdown.html # 個股查詢
│   └── assets/             # 樣式和腳本
├── data_collector.py       # 資料收集腳本
├── start_server.py         # 伺服器啟動腳本
└── 啟動.bat               # Windows 快速啟動
```

## 🔧 系統需求

- Python 3.7+
- 相依套件：
  ```bash
  pip install requests pandas python-dateutil
  ```

## 📖 使用說明

### 資料收集

資料收集器會自動：
- 調用野村基金 API 獲取最新持股資料
- 按月份組織並儲存為 CSV 檔案
- 避免重複收集已存在的資料
- 提供詳細的執行日誌

### 網頁介面

1. **總覽頁面** (`index.html`)
   - 顯示最新資料統計
   - 提供功能導航
   - 展示最近資料預覽

2. **完整表格** (`table_full.html`)
   - 所有持股資料的完整檢視
   - 支援多條件篩選
   - 可按任意欄位排序
   - 分頁顯示提升效能

3. **個股查詢** (`table_dropdown.html`)
   - 選擇特定股票查看持股變化
   - 顯示該股票的歷史持股資料
   - 計算權重變化趨勢

## ⚠️ 注意事項

- **CORS 限制**: 必須使用 HTTP 伺服器，無法直接開啟 HTML 檔案
- **資料更新**: 建議每日執行 `data_collector.py` 更新資料
- **網路需求**: 初次執行需要網路連線以獲取資料

## 🚨 常見問題

### Q: 為什麼直接點擊 HTML 檔案無法載入資料？
A: 由於瀏覽器的 CORS 安全政策，必須使用 HTTP 伺服器。請使用 `start_server.py` 或手動啟動 `python -m http.server 8000`。

### Q: 如何更新資料？
A: 執行 `python data_collector.py` 即可自動獲取最新的持股資料。

### Q: 資料從哪裡來？
A: 資料來源為野村基金官方 API，確保資料的準確性和即時性。

## 📄 授權

MIT License - 詳見 LICENSE 檔案

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request 來改善這個專案！
