/**
 * 個股查詢頁面 JavaScript
 * 處理下拉選單和個股資料展示
 */

let allStockData = [];
let selectedStock = null;

/**
 * 初始化個股查詢頁面
 */
async function initializeDropdownTable() {
    console.log('🎯 初始化個股查詢...');
    
    try {
        // 載入所有資料
        allStockData = await window.ETFAnalyzer.loadAllData();
        
        if (allStockData.length === 0) {
            showError('無法載入資料');
            return;
        }
        
        // 初始化股票下拉選單
        initializeStockDropdown();
        
        // 初始化搜尋功能
        initializeStockSearch();
        
    } catch (error) {
        console.error('初始化個股查詢時發生錯誤:', error);
        showError('載入資料時發生錯誤');
    }
}

/**
 * 初始化股票下拉選單
 */
function initializeStockDropdown() {
    const stockSelect = document.getElementById('stockSelect');
    
    // 取得所有股票並按權重排序
    const stockMap = new Map();
    
    allStockData.forEach(item => {
        const stockCode = item['股票代號'];
        const stockName = item['股票名稱'];
        const weight = parseFloat(item['權重']) || 0;
        
        if (!stockMap.has(stockCode)) {
            stockMap.set(stockCode, {
                code: stockCode,
                name: stockName,
                maxWeight: weight
            });
        } else {
            const existing = stockMap.get(stockCode);
            if (weight > existing.maxWeight) {
                existing.maxWeight = weight;
            }
        }
    });
    
    // 按最大權重排序
    const sortedStocks = Array.from(stockMap.values())
        .sort((a, b) => b.maxWeight - a.maxWeight);
    
    // 建立下拉選單選項
    stockSelect.innerHTML = '<option value="">請選擇股票</option>';
    
    sortedStocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.code;
        option.textContent = `${stock.code} - ${stock.name} (最高權重: ${stock.maxWeight.toFixed(2)}%)`;
        stockSelect.appendChild(option);
    });
    
    // 下拉選單變更事件
    stockSelect.addEventListener('change', function() {
        if (this.value) {
            selectStock(this.value);
        } else {
            clearStockDisplay();
        }
    });
}

/**
 * 初始化搜尋功能
 */
function initializeStockSearch() {
    const stockSearch = document.getElementById('stockSearch');
    
    stockSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const stockSelect = document.getElementById('stockSelect');
        
        // 過濾選項
        Array.from(stockSelect.options).forEach(option => {
            if (option.value === '') return; // 跳過預設選項
            
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

/**
 * 選擇股票
 */
function selectStock(stockCode) {
    selectedStock = stockCode;
    
    // 過濾該股票的資料
    const stockData = allStockData.filter(item => item['股票代號'] === stockCode);
    
    if (stockData.length === 0) {
        showError('找不到該股票的資料');
        return;
    }
    
    // 顯示股票資訊
    displayStockInfo(stockData);
    
    // 顯示股票資料表
    displayStockTable(stockData);
}

/**
 * 顯示股票資訊
 */
function displayStockInfo(stockData) {
    const stockInfoSection = document.getElementById('stockInfoSection');
    const stockSummary = document.getElementById('stockSummary');
    
    // 計算統計資訊
    const weights = stockData.map(item => parseFloat(item['權重'])).filter(w => !isNaN(w));
    const shares = stockData.map(item => parseInt(item['股數'].replace(/,/g, ''))).filter(s => !isNaN(s));
    
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    
    const maxShares = Math.max(...shares);
    const minShares = Math.min(...shares);
    
    const firstDate = stockData[0]['日期'];
    const lastDate = stockData[stockData.length - 1]['日期'];
    
    stockSummary.innerHTML = `
        <div class="stock-header">
            <h3>${stockData[0]['股票代號']} - ${stockData[0]['股票名稱']}</h3>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>📅 資料期間</h4>
                <p>${firstDate} ~ ${lastDate}</p>
            </div>
            <div class="stat-card">
                <h4>⚖️ 權重範圍</h4>
                <p>${minWeight.toFixed(2)}% ~ ${maxWeight.toFixed(2)}%</p>
                <small>平均: ${avgWeight.toFixed(2)}%</small>
            </div>
            <div class="stat-card">
                <h4>📊 股數範圍</h4>
                <p>${window.ETFAnalyzer.formatNumber(minShares)} ~ ${window.ETFAnalyzer.formatNumber(maxShares)}</p>
            </div>
            <div class="stat-card">
                <h4>📈 記錄數</h4>
                <p>${stockData.length} 筆</p>
            </div>
        </div>
    `;
    
    stockInfoSection.style.display = 'block';
}

/**
 * 顯示股票資料表
 */
function displayStockTable(stockData) {
    const stockTableBody = document.getElementById('stockTableBody');
    const recordCount = document.getElementById('recordCount');
    
    // 計算變化
    const dataWithChanges = stockData.map((item, index) => {
        const result = { ...item };
        
        if (index > 0) {
            const prevWeight = parseFloat(stockData[index - 1]['權重']);
            const currWeight = parseFloat(item['權重']);
            const weightChange = currWeight - prevWeight;
            
            const prevShares = parseInt(stockData[index - 1]['股數'].replace(/,/g, ''));
            const currShares = parseInt(item['股數'].replace(/,/g, ''));
            const sharesChange = currShares - prevShares;
            
            result.weightChange = weightChange;
            result.sharesChange = sharesChange;
        } else {
            result.weightChange = 0;
            result.sharesChange = 0;
        }
        
        return result;
    });
    
    // 建立表格內容
    const tbody = dataWithChanges.map(item => {
        const weightChange = item.weightChange;
        const sharesChange = item.sharesChange;
        
        let weightChangeClass = '';
        let weightChangeText = '';
        if (weightChange > 0) {
            weightChangeClass = 'positive-change';
            weightChangeText = `+${weightChange.toFixed(2)}%`;
        } else if (weightChange < 0) {
            weightChangeClass = 'negative-change';
            weightChangeText = `${weightChange.toFixed(2)}%`;
        } else {
            weightChangeText = '-';
        }
        
        let sharesChangeClass = '';
        let sharesChangeText = '';
        if (sharesChange > 0) {
            sharesChangeClass = 'positive-change';
            sharesChangeText = `+${window.ETFAnalyzer.formatNumber(sharesChange)}`;
        } else if (sharesChange < 0) {
            sharesChangeClass = 'negative-change';
            sharesChangeText = `${window.ETFAnalyzer.formatNumber(sharesChange)}`;
        } else {
            sharesChangeText = '-';
        }
        
        return `
            <tr>
                <td>${item['日期']}</td>
                <td>${window.ETFAnalyzer.formatNumber(item['股數'])}</td>
                <td>${item['權重']}%</td>
                <td class="${weightChangeClass}">${weightChangeText}</td>
                <td class="${sharesChangeClass}">${sharesChangeText}</td>
            </tr>
        `;
    }).join('');
    
    stockTableBody.innerHTML = tbody;
    recordCount.textContent = `共 ${stockData.length} 筆記錄`;
}

/**
 * 清除股票顯示
 */
function clearStockDisplay() {
    const stockInfoSection = document.getElementById('stockInfoSection');
    const stockTableBody = document.getElementById('stockTableBody');
    const recordCount = document.getElementById('recordCount');
    
    stockInfoSection.style.display = 'none';
    stockTableBody.innerHTML = '<tr><td colspan="5" class="loading">👆 請選擇股票查看資料</td></tr>';
    recordCount.textContent = '請選擇股票查看資料';
}

/**
 * 顯示錯誤
 */
function showError(message) {
    const stockTableBody = document.getElementById('stockTableBody');
    stockTableBody.innerHTML = `<tr><td colspan="5" class="error">❌ ${message}</td></tr>`;
}

// 全域函式
window.initializeDropdownTable = initializeDropdownTable;
