/**
 * ETF 持股變化分析器 - 主要 JavaScript 檔案
 * 負責資料載入、處理和基礎互動功能
 */

// 全域變數
let holdingsData = {};
let allStocks = new Set();

// 初始化應用程式
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ETF 持股分析器初始化...');
    
    // 設定最後更新時間
    updateLastUpdateTime();
    
    // 如果在主頁，載入統計資料和最新資料預覽
    if (document.getElementById('recent-data-container')) {
        loadOverviewStats();
        loadRecentDataPreview();
    }
    
    // 初始化其他頁面特定功能
    initializePageSpecificFeatures();
});

/**
 * 載入總覽統計資料
 */
async function loadOverviewStats() {
    try {
        console.log('📊 載入總覽統計資料...');
        
        // 載入所有資料
        const allData = await loadAllDataForHome();
        
        if (allData && allData.length > 0) {
            // 計算統計資料
            const stats = calculateOverviewStats(allData);
            
            // 更新 UI
            updateOverviewUI(stats);
        } else {
            showStatsError();
        }
    } catch (error) {
        console.error('載入統計資料時發生錯誤:', error);
        showStatsError();
    }
}

/**
 * 動態檢測可用的月份檔案
 */
async function detectAvailableMonths() {
    const availableMonths = [];
    
    // 從 2025-05 開始檢測到當前年月+1個月
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() 回傳 0-11
    
    // 檢測從 2025-05 到目前月份+1個月的所有可能檔案
    for (let year = 2025; year <= currentYear; year++) {
        const startMonth = year === 2025 ? 5 : 1; // 2025年從5月開始
        const endMonth = year === currentYear ? Math.min(currentMonth + 1, 12) : 12;
        
        for (let month = startMonth; month <= endMonth; month++) {
            const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
            
            try {
                // 使用動態路徑檢測
                const dataPath = window.location.hostname === 'anguspantw.github.io' ? 'data/' : '/docs/data/';
                const response = await fetch(`${dataPath}holdings_${monthStr}.csv`, {
                    method: 'HEAD' // 只檢查檔案是否存在，不下載內容
                });
                
                if (response.ok) {
                    availableMonths.push(monthStr);
                    console.log(`✅ 檢測到檔案: holdings_${monthStr}.csv`);
                }
            } catch (error) {
                // 檔案不存在，忽略錯誤
                console.log(`⏸️ 檔案不存在: holdings_${monthStr}.csv`);
            }
        }
    }
    
    return availableMonths.sort(); // 確保按時間順序排列
}

/**
 * 為其他頁面檢測可用的月份檔案（使用絕對路徑）
 */
async function detectAvailableMonthsForSubPages() {
    const availableMonths = [];
    
    // 從 2025-05 開始檢測到當前年月+1個月
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() 回傳 0-11
    
    // 檢測從 2025-05 到目前月份+1個月的所有可能檔案
    for (let year = 2025; year <= currentYear; year++) {
        const startMonth = year === 2025 ? 5 : 1; // 2025年從5月開始
        const endMonth = year === currentYear ? Math.min(currentMonth + 1, 12) : 12;
        
        for (let month = startMonth; month <= endMonth; month++) {
            const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
            
            try {
                // 使用動態路徑檢測
                const dataPath = window.location.hostname === 'anguspantw.github.io' ? 'data/' : '/docs/data/';
                const response = await fetch(`${dataPath}holdings_${monthStr}.csv`, {
                    method: 'HEAD' // 只檢查檔案是否存在，不下載內容
                });
                
                if (response.ok) {
                    availableMonths.push(monthStr);
                    console.log(`✅ 檢測到檔案: holdings_${monthStr}.csv`);
                }
            } catch (error) {
                // 檔案不存在，忽略錯誤
                console.log(`⏸️ 檔案不存在: holdings_${monthStr}.csv`);
            }
        }
    }
    
    return availableMonths.sort(); // 確保按時間順序排列
}

/**
 * 載入主頁所需的所有資料
 */
async function loadAllDataForHome() {
    // 主頁需要按月份分組的資料，直接使用陣列版本即可
    return await loadAllDataAsArray();
}

/**
 * 計算總覽統計資料
 */
function calculateOverviewStats(data) {
    // 取得所有日期並排序
    const allDates = [...new Set(data.map(item => item['日期']))].sort();
    
    // 計算每日持股數量
    const dailyHoldings = {};
    data.forEach(item => {
        const date = item['日期'];
        if (!dailyHoldings[date]) {
            dailyHoldings[date] = new Set();
        }
        dailyHoldings[date].add(item['股票代號']);
    });
    
    // 計算平均持股數
    const avgHoldings = Math.round(
        Object.values(dailyHoldings).reduce((sum, stocks) => sum + stocks.size, 0) / allDates.length
    );
    
    return {
        startDate: allDates[0],
        endDate: allDates[allDates.length - 1],
        totalRecords: data.length,
        tradingDays: allDates.length,
        avgHoldings: avgHoldings
    };
}

/**
 * 更新總覽 UI
 */
function updateOverviewUI(stats) {
    document.getElementById('date-start').textContent = stats.startDate;
    document.getElementById('date-end').textContent = stats.endDate;
    document.getElementById('total-records').textContent = stats.totalRecords.toLocaleString('zh-TW');
    document.getElementById('trading-days').textContent = stats.tradingDays;
    document.getElementById('avg-holdings').textContent = stats.avgHoldings;
    
    console.log('✅ 統計資料更新完成:', stats);
}

/**
 * 顯示統計資料載入錯誤
 */
function showStatsError() {
    document.getElementById('date-start').textContent = '載入失敗';
    document.getElementById('date-end').textContent = '載入失敗';
    document.getElementById('total-records').textContent = '載入失敗';
    document.getElementById('trading-days').textContent = '載入失敗';
    document.getElementById('avg-holdings').textContent = '載入失敗';
}

/**
 * 更新最後更新時間
 */
function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.textContent = now.toLocaleString('zh-TW');
    }
}

/**
 * 載入最新資料預覽
 */
async function loadRecentDataPreview() {
    const container = document.getElementById('recent-data-container');
    if (!container) return;
    
    try {
        // 動態檢測最新的月份檔案
        const availableMonths = await detectAvailableMonths();
        
        if (availableMonths.length === 0) {
            container.innerHTML = '<p class="error">❌ 沒有找到任何資料檔案</p>';
            return;
        }
        
        // 使用最新的月份檔案
        const latestMonth = availableMonths[availableMonths.length - 1];
        console.log('📊 載入最新月份資料:', latestMonth);
        
        // 使用動態路徑
        const dataPath = window.location.hostname === 'anguspantw.github.io' ? 'data/' : '/docs/data/';
        const latestData = await loadCSVData(`${dataPath}holdings_${latestMonth}.csv`);

        if (latestData && latestData.length > 0) {
            // 取得最新日期的資料
            const latestDate = latestData[0]['日期'];
            const latestDayData = latestData.filter(item => item['日期'] === latestDate);
            
            // 顯示前10大持股
            displayTopHoldings(latestDayData.slice(0, 10), container);
        } else {
            container.innerHTML = '<p class="error">❌ 無法載入資料</p>';
        }
    } catch (error) {
        console.error('載入資料預覽時發生錯誤:', error);
        container.innerHTML = '<p class="error">❌ 載入資料時發生錯誤</p>';
    }
}

/**
 * 顯示前十大持股
 */
function displayTopHoldings(data, container) {
    let html = `
        <div class="top-holdings">
            <h3>📈 最新持股前十大 (${data[0]['日期']})</h3>
            <div class="holdings-grid">
    `;
    
    data.forEach((stock, index) => {
        html += `
            <div class="holding-card">
                <div class="holding-rank">#${index + 1}</div>
                <div class="holding-info">
                    <h4>${stock['股票代號']} ${stock['股票名稱']}</h4>
                    <div class="holding-stats">
                        <span class="weight">權重: ${stock['權重']}%</span>
                        <span class="shares">股數: ${formatNumber(stock['股數'])}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * 載入 CSV 資料
 */
async function loadCSVData(filePath) {
    try {
        console.log('嘗試載入檔案:', filePath);
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV 檔案大小:', csvText.length, '字元');
        const data = parseCSV(csvText);
        console.log('解析完成，共', data.length, '筆記錄');
        return data;
    } catch (error) {
        console.error('載入 CSV 檔案時發生錯誤:', error);
        return null;
    }
}

/**
 * 解析 CSV 資料
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // 跳過空行
        
        // 處理包含逗號的欄位（用引號包圍）
        const values = parseCSVLine(lines[i]);
        const row = {};
        
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        
        data.push(row);
    }
    
    return data;
}

/**
 * 解析 CSV 行（處理引號包圍的欄位）
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current); // 最後一個值
    return values;
}

/**
 * 格式化數字顯示
 */
function formatNumber(num) {
    if (typeof num === 'string') {
        num = parseInt(num.replace(/,/g, ''));
    }
    return num.toLocaleString('zh-TW');
}

/**
 * 格式化百分比顯示
 */
function formatPercentage(num) {
    if (typeof num === 'string') {
        num = parseFloat(num);
    }
    return num.toFixed(2) + '%';
}

/**
 * 載入所有月份的資料並合併為陣列（供表格使用）
 */
async function loadAllDataAsArray() {
    try {
        // 載入所有資料（物件格式）
        const allDataByMonth = await loadAllDataByMonth();
        const allDataArray = [];
        
        // 將所有月份的資料合併成一個陣列
        Object.values(allDataByMonth).forEach(monthData => {
            if (Array.isArray(monthData)) {
                allDataArray.push(...monthData);
            }
        });
        
        console.log('📊 合併後資料總數:', allDataArray.length);
        return allDataArray;
    } catch (error) {
        console.error('❌ 載入陣列格式資料失敗:', error);
        return [];
    }
}

/**
 * 載入所有月份的資料（按月份分組）
 */
async function loadAllDataByMonth() {
    try {
        // 所有頁面都使用統一的檢測函式
        const availableMonths = await detectAvailableMonths();
            
        const allData = {};
        
        if (availableMonths.length === 0) {
            console.warn('❌ 沒有找到任何資料檔案');
            return allData;
        }
        
        console.log('📅 檢測到可用月份:', availableMonths);
        
        for (const month of availableMonths) {
            try {
                // 使用動態路徑
                const dataPath = window.location.hostname === 'anguspantw.github.io' ? 'data/' : '/docs/data/';
                
                const data = await loadCSVData(`${dataPath}holdings_${month}.csv`);
                if (data && data.length > 0) {
                    allData[month] = data;
                    console.log(`✅ 載入 ${month}:`, data.length, '筆記錄');
                }
            } catch (error) {
                console.error(`❌ 載入 ${month} 資料失敗:`, error);
            }
        }
        
        console.log('📊 所有資料載入完成:', Object.keys(allData).length, '個月份');
        return allData;
    } catch (error) {
        console.error('❌ 動態載入所有資料失敗:', error);
        return {};
    }
}

/**
 * 載入所有月份的資料
 */
async function loadAllData() {
    // 回傳按月份分組的物件格式，保持原本行為
    return await loadAllDataByMonth();
}

/**
 * 取得所有股票代號
 */
function getAllStocks(data) {
    const stocks = new Set();
    data.forEach(item => {
        stocks.add(item['股票代號']);
    });
    return Array.from(stocks).sort();
}

/**
 * 過濾特定股票的資料
 */
function filterStockData(data, stockCode) {
    return data.filter(item => item['股票代號'] === stockCode);
}

/**
 * 取得日期範圍
 */
function getDateRange(data) {
    const dates = [...new Set(data.map(item => item['日期']))].sort();
    return {
        start: dates[0],
        end: dates[dates.length - 1],
        all: dates
    };
}

/**
 * 初始化頁面特定功能
 */
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch (currentPage) {
        case 'table_full.html':
            if (typeof initializeFullTable === 'function') {
                initializeFullTable();
            }
            break;
        case 'table_dropdown.html':
            if (typeof initializeDropdownTable === 'function') {
                initializeDropdownTable();
            }
            break;
        case 'charts_separate.html':
            if (typeof initializeSeparateCharts === 'function') {
                initializeSeparateCharts();
            }
            break;
        case 'charts_dual_axis.html':
            if (typeof initializeDualAxisCharts === 'function') {
                initializeDualAxisCharts();
            }
            break;
    }
}

/**
 * 顯示載入狀態
 */
function showLoading(element) {
    element.innerHTML = '<div class="loading">⏳ 載入中...</div>';
}

/**
 * 顯示錯誤訊息
 */
function showError(element, message) {
    element.innerHTML = `<div class="error">❌ ${message}</div>`;
}

/**
 * 工具函式：防抖動
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 工具函式：節流
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 匯出供其他檔案使用的函式
window.ETFAnalyzer = {
    loadCSVData,
    parseCSV,
    formatNumber,
    formatPercentage,
    loadAllData,
    loadAllDataAsArray,
    loadAllDataByMonth,
    getAllStocks,
    filterStockData,
    getDateRange,
    showLoading,
    showError,
    debounce,
    throttle,
    detectAvailableMonths,
    detectAvailableMonthsForSubPages
};
