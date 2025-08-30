#!/usr/bin/env python3
"""
ETF 資料更新與伺服器啟動腳本
簡單兩步驟：
1. 更新資料：python data_collector.py
2. 啟動伺服器：python start_server.py
"""

import subprocess
import webbrowser
import sys
import time
from pathlib import Path

def main():
    """主函式"""
    print("🚀 ETF 持股分析器 - 伺服器啟動腳本")
    print("=" * 50)
    
    # 檢查是否在正確目錄
    if not Path("data_collector.py").exists():
        print("❌ 找不到 data_collector.py")
        print("💡 請在專案根目錄執行此腳本")
        return False
    
    # 檢查資料是否存在
    data_dir = Path("docs/data")
    csv_files = list(data_dir.glob("holdings_*.csv")) if data_dir.exists() else []
    
    if not csv_files:
        print("⚠️ 未找到 CSV 資料檔案")
        print("🔄 請先執行：python data_collector.py")
        choice = input("\n是否現在執行資料收集? (y/N): ")
        if choice.lower() == 'y':
            print("\n📡 正在收集資料...")
            try:
                subprocess.run([sys.executable, "data_collector.py"], check=True)
                print("✅ 資料收集完成")
            except subprocess.CalledProcessError:
                print("❌ 資料收集失敗")
                return False
        else:
            print("💡 請先執行 data_collector.py 收集資料")
            return False
    else:
        print(f"✅ 找到 {len(csv_files)} 個資料檔案")
    
    # 啟動 HTTP 伺服器
    print("\n🌐 啟動 HTTP 伺服器...")
    try:
        import http.server
        import socketserver
        import threading
        
        PORT = 8000
        
        # 切換到專案根目錄
        project_root = Path.cwd()
        print(f"📁 伺服器根目錄: {project_root}")
        
        # 建立伺服器
        Handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🌐 伺服器啟動成功: http://localhost:{PORT}")
            print(f"🏠 主頁面: http://localhost:{PORT}/docs/index.html")
            print(f"📊 完整表格: http://localhost:{PORT}/docs/table_full.html")
            print(f"🔍 個股查詢: http://localhost:{PORT}/docs/table_dropdown.html")
            print("\n按 Ctrl+C 停止伺服器")
            
            # 自動開啟瀏覽器
            time.sleep(1)
            try:
                webbrowser.open(f"http://localhost:{PORT}/docs/index.html")
                print("🌍 已自動開啟瀏覽器")
            except:
                print("⚠️ 無法自動開啟瀏覽器，請手動訪問上述網址")
            
            # 啟動伺服器
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n👋 伺服器已停止")
        return True
    except Exception as e:
        print(f"\n❌ 伺服器啟動失敗: {e}")
        return False

if __name__ == "__main__":
    main()
