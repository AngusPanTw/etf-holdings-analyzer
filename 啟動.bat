@echo off
echo =============================================
echo  ETF ���Ѥ��R�� - �ֳt�Ұ�
echo =============================================
echo.

echo  �ˬd Python ����...
python --version >nul 2>&1
if errorlevel 1 (
    echo  ����� Python�A�Х��w�� Python
    pause
    exit /b 1
)

echo  Python ���ҥ��`

echo.
echo  �Ұʦ��A��...
python start_server.py

pause
