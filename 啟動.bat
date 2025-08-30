@echo off
echo =============================================
echo  ETF 持股分析器 - 快速啟動
echo =============================================
echo.

echo  檢查 Python 環境...
python --version >nul 2>&1
if errorlevel 1 (
    echo  未找到 Python，請先安裝 Python
    pause
    exit /b 1
)

echo  Python 環境正常

echo.
echo  啟動伺服器...
python start_server.py

pause
