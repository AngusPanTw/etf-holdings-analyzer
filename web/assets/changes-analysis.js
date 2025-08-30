/**
 * 成分股變化分析 JavaScript
 * 分析 ETF 在選定月份內的每日成分股變化
 */

// 全域變數
let allStockData = {};
let availableMonths = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 成分股變化分析初始化 (v2 - 每日分析)...');
    loadStockData();
});

/**
 * 載入所有月份的股票資料
 */
async function loadStockData() {
    try {
        console.log('📡 載入所有股票資料...');
        // 使用 window.ETFAnalyzer.loadAllData 來載入所有資料
        allStockData = await window.ETFAnalyzer.loadAllData();
        
        // 取得可用月份並排序
        availableMonths = Object.keys(allStockData).sort();
        console.log('📅 可用月份:', availableMonths);
        
        // 建立月份選擇器
        createMonthSelector();
        
    } catch (error) {
        console.error('❌ 載入資料失敗:', error);
        document.getElementById('month-selector').innerHTML = 
            '<div class="no-data">載入資料失敗，請檢查主控台或重新整理頁面</div>';
    }
}

/**
 * 建立月份選擇器
 */
function createMonthSelector() {
    const monthSelector = document.getElementById('month-selector');
    
    if (availableMonths.length === 0) {
        monthSelector.innerHTML = '<div class="no-data">沒有可用的月份資料</div>';
        return;
    }
    
    monthSelector.innerHTML = '';
    
    // 從第一個月開始，讓所有月份都能被分析
    for (let i = 0; i < availableMonths.length; i++) {
        const month = availableMonths[i];
        // 如果是第一個月，則沒有前一個月
        const prevMonth = i > 0 ? availableMonths[i - 1] : null;
        
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';
        monthCard.dataset.month = month;
        if (prevMonth) {
            monthCard.dataset.prevMonth = prevMonth;
        }
        
        // 預先計算該月份的簡要統計
        const previewStats = calculateMonthPreview(month, prevMonth);
        
        monthCard.innerHTML = `
            <h4>${month}</h4>
            <p>點擊分析此月份的<br>每日成分股變化</p>
            <div style="margin-top: 0.75rem; font-size: 0.85rem; color: #666;">
                <div style="color: #4CAF50;">📈 新增: ${previewStats.added} 檔</div>
                <div style="color: #f44336;">📉 移除: ${previewStats.removed} 檔</div>
                <div style="color: #2196F3;">📊 持有: ${previewStats.stable} 檔</div>
            </div>
        `;
        
        monthCard.addEventListener('click', () => selectMonth(month, prevMonth));
        monthSelector.appendChild(monthCard);
    }
}

/**
 * 計算指定月份的簡要統計預覽
 * @param {string} currentMonth 要分析的月份
 * @param {string} prevMonth 前一個月份（可能為 null）
 * @returns {object} 包含 added, removed, stable 數量的物件
 */
function calculateMonthPreview(currentMonth, prevMonth) {
    try {
        // 1. 整合所需資料
        const currentMonthData = allStockData[currentMonth] || [];
        const prevMonthData = prevMonth ? allStockData[prevMonth] || [] : [];
        const allData = [...prevMonthData, ...currentMonthData];

        if (allData.length < 2) {
            return { added: 0, removed: 0, stable: 0 };
        }

        // 2. 按日期將持股資料分組
        const holdingsByDate = new Map();
        allData.forEach(holding => {
            const date = holding['日期'];
            if (!holdingsByDate.has(date)) {
                holdingsByDate.set(date, []);
            }
            holdingsByDate.get(date).push(holding);
        });
        const sortedDates = [...holdingsByDate.keys()].sort();

        // 3. 找到分析的起始點
        const firstDayOfMonthIndex = sortedDates.findIndex(d => d.startsWith(currentMonth));
        if (firstDayOfMonthIndex === -1) {
            return { added: 0, removed: 0, stable: 0 };
        }

        // 4. 快速統計：只計算數量，不儲存詳細資訊
        const loopStartIndex = firstDayOfMonthIndex === 0 ? 1 : firstDayOfMonthIndex;
        
        let yesterdayStocks = new Set(
            (holdingsByDate.get(sortedDates[loopStartIndex - 1]) || []).map(h => h['股票代號'])
        );

        const addedStocks = new Set();
        const removedStocks = new Set();

        // 5. 執行快速逐日比較
        for (let i = loopStartIndex; i < sortedDates.length; i++) {
            const todayDate = sortedDates[i];
            
            // 如果日期已經超出當前月份，則停止
            if (!todayDate.startsWith(currentMonth)) {
                break;
            }

            const todayHoldings = holdingsByDate.get(todayDate) || [];
            const todayStocks = new Set(todayHoldings.map(h => h['股票代號']));

            // 找出新增和移除的股票（僅記錄股票代號）
            for (const stockCode of todayStocks) {
                if (!yesterdayStocks.has(stockCode)) {
                    addedStocks.add(stockCode);
                }
            }
            for (const stockCode of yesterdayStocks) {
                if (!todayStocks.has(stockCode)) {
                    removedStocks.add(stockCode);
                }
            }

            // 狀態轉移
            yesterdayStocks = todayStocks;
        }

        // 6. 計算穩定持有股票數量
        const monthEndDate = sortedDates.filter(d => d.startsWith(currentMonth)).pop();
        const monthInitialDate = firstDayOfMonthIndex > 0 ? sortedDates[firstDayOfMonthIndex - 1] : sortedDates[firstDayOfMonthIndex];
        
        const initialStocks = new Set((holdingsByDate.get(monthInitialDate) || []).map(h => h['股票代號']));
        const endStocks = new Set((holdingsByDate.get(monthEndDate) || []).map(h => h['股票代號']));
        
        const stableCount = [...initialStocks].filter(code => endStocks.has(code)).length;

        return {
            added: addedStocks.size,
            removed: removedStocks.size,
            stable: stableCount
        };
        
    } catch (error) {
        console.warn(`計算 ${currentMonth} 預覽統計時發生錯誤:`, error);
        return { added: 0, removed: 0, stable: 0 };
    }
}

/**
 * 選擇月份進行分析
 */
function selectMonth(currentMonth, prevMonth) {
    // 更新選中狀態
    document.querySelectorAll('.month-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-month="${currentMonth}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    console.log(`🔍 分析 ${currentMonth} 的每日變化 (與 ${prevMonth} 月底比較)`);
    
    // 執行分析
    analyzeDailyChanges(currentMonth, prevMonth);
    
    // 顯示結果區塊
    document.getElementById('analysis-result').style.display = 'block';
    
    // 滾動到結果
    document.getElementById('analysis-result').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

/**
 * 將日誌訊息附加到頁面的偵錯區域
 * @param {string} message 要記錄的訊息
 */
function logToPage(message) {
    const logContainer = document.getElementById('debug-log');
    if (logContainer) {
        logContainer.textContent += message + '\n';
    }
    console.log(message); // 同時在主控台輸出
}

/**
 * 分析指定月份的每日成分股變化
 */
function analyzeDailyChanges(currentMonth, prevMonth) {
    const logContainer = document.getElementById('debug-log');
    logContainer.textContent = ''; // 清空日誌

    logToPage(`📊 [開始分析] ${currentMonth} (與 ${prevMonth || '無'} 比較)`);

    // 1. 整合所需資料
    const currentMonthData = allStockData[currentMonth] || [];
    const prevMonthData = prevMonth ? allStockData[prevMonth] || [] : [];
    const allData = [...prevMonthData, ...currentMonthData];

    if (allData.length < 2) {
        logToPage('❌ [錯誤] 資料不足，無法進行每日比較。');
        return;
    }

    // 2. 按日期將持股資料分組
    const holdingsByDate = new Map();
    allData.forEach(holding => {
        const date = holding['日期'];
        if (!holdingsByDate.has(date)) {
            holdingsByDate.set(date, []);
        }
        holdingsByDate.get(date).push(holding);
    });
    const sortedDates = [...holdingsByDate.keys()].sort();
    logToPage(`\n📅 [資料準備] 找到 ${sortedDates.length} 個交易日進行分析:`);
    logToPage(sortedDates.join(', '));

    // 3. 找到分析的起始點
    const firstDayOfMonthIndex = sortedDates.findIndex(d => d.startsWith(currentMonth));
    if (firstDayOfMonthIndex === -1) {
        logToPage(`❌ [錯誤] 在資料中找不到 ${currentMonth} 的任何交易日。`);
        return;
    }
    if (firstDayOfMonthIndex === 0 && sortedDates.length < 2) {
        logToPage('❌ [錯誤] 只有一天資料，無法比較。');
        return;
    }
    
    // 4. 初始化滾動比較的變數
    // 如果是資料中的第一個月，比較從該月的第二天開始
    // 否則，從該月的第一天開始（與上個月最後一天比較）
    const loopStartIndex = firstDayOfMonthIndex === 0 ? 1 : firstDayOfMonthIndex;
    
    let yesterdayStocks = new Set(
        (holdingsByDate.get(sortedDates[loopStartIndex - 1]) || []).map(h => h['股票代號'])
    );
    let yesterdayHoldingsMap = new Map(
        (holdingsByDate.get(sortedDates[loopStartIndex - 1]) || []).map(h => [h['股票代號'], h])
    );

    const monthlyAdditions = [];
    const monthlyRemovals = [];

    logToPage('\n🔄 [開始逐日比較]');
    logToPage('─'.repeat(40));

    // 5. 執行逐日滾動比較
    for (let i = loopStartIndex; i < sortedDates.length; i++) {
        const todayDate = sortedDates[i];
        const yesterdayDate = sortedDates[i-1];

        // 如果日期已經超出當前月份，則停止
        if (!todayDate.startsWith(currentMonth)) {
            logToPage(`\n🏁 [分析結束] 已到達 ${todayDate}，超出 ${currentMonth} 範圍。`);
            break;
        }

        const todayHoldings = holdingsByDate.get(todayDate) || [];
        const todayStocks = new Set(todayHoldings.map(h => h['股票代號']));
        const todayHoldingsMap = new Map(todayHoldings.map(h => [h['股票代號'], h]));

        logToPage(`\n🔍 [比較日] ${todayDate} (vs ${yesterdayDate})`);
        logToPage(`   昨日持股: ${yesterdayStocks.size} 檔 | 今日持股: ${todayStocks.size} 檔`);

        // 找出新增
        const dailyAdditions = [];
        for (const stockCode of todayStocks) {
            if (!yesterdayStocks.has(stockCode)) {
                const stockInfo = todayHoldingsMap.get(stockCode);
                dailyAdditions.push(stockInfo);
                monthlyAdditions.push({ ...stockInfo, changeDate: todayDate });
            }
        }
        if(dailyAdditions.length > 0) {
            logToPage(`   [+] 新增 ${dailyAdditions.length} 檔: ${dailyAdditions.map(s => s['股票代號']).join(', ')}`);
        }

        // 找出移除
        const dailyRemovals = [];
        for (const stockCode of yesterdayStocks) {
            if (!todayStocks.has(stockCode)) {
                const stockInfo = yesterdayHoldingsMap.get(stockCode);
                dailyRemovals.push(stockInfo);
                monthlyRemovals.push({ ...stockInfo, changeDate: todayDate });
            }
        }
        if(dailyRemovals.length > 0) {
            logToPage(`   [-] 移除 ${dailyRemovals.length} 檔: ${dailyRemovals.map(s => s['股票代號']).join(', ')}`);
        }

        if (dailyAdditions.length === 0 && dailyRemovals.length === 0) {
            logToPage('   [=] 成分股無變化');
        }

        // 狀態轉移：今天變成昨天
        yesterdayStocks = todayStocks;
        yesterdayHoldingsMap = todayHoldingsMap;
    }
    logToPage('─'.repeat(40));

    // 6. 處理最終結果
    const finalAdditions = new Map();
    monthlyAdditions.forEach(stock => {
        if (!finalAdditions.has(stock['股票代號'])) {
            finalAdditions.set(stock['股票代號'], stock);
        }
    });

    const finalRemovals = new Map();
    monthlyRemovals.forEach(stock => {
        if (!finalRemovals.has(stock['股票代號'])) {
            finalRemovals.set(stock['股票代號'], stock);
        }
    });

    const addedStocksList = [...finalAdditions.values()];
    const removedStocksList = [...finalRemovals.values()];

    logToPage('\n✅ [分析完成]');
    logToPage(`   本月總計新增: ${addedStocksList.length} 檔`);
    logToPage(`   本月總計移除: ${removedStocksList.length} 檔`);

    // 7. 計算穩定持有股票
    const monthStartDate = sortedDates[firstDayOfMonthIndex];
    const monthInitialDate = firstDayOfMonthIndex > 0 ? sortedDates[firstDayOfMonthIndex - 1] : monthStartDate;
    const monthEndDate = sortedDates.filter(d => d.startsWith(currentMonth)).pop();

    const initialHoldings = holdingsByDate.get(monthInitialDate) || [];
    const endHoldings = holdingsByDate.get(monthEndDate) || [];
    
    const initialStocks = new Set(initialHoldings.map(h => h['股票代號']));
    const endStocks = new Set(endHoldings.map(h => h['股票代號']));
    
    const stableStocks = [...initialStocks].filter(code => endStocks.has(code));
    
    // 8. 更新 UI
    updateSummaryStats(addedStocksList.length, removedStocksList.length, stableStocks.length, endStocks.size, currentMonth);
    updateNewStocksList(addedStocksList);
    updateRemovedStocksList(removedStocksList);
    
    const endHoldingsMap = new Map(endHoldings.map(h => [h['股票代號'], h]));
    const initialHoldingsMap = new Map(initialHoldings.map(h => [h['股票代號'], h]));
    
    updateContinuingStocksList(stableStocks, endHoldingsMap, initialHoldingsMap);
}


/**
 * 更新統計摘要
 */
function updateSummaryStats(newCount, removedCount, continuingCount, totalCount, currentMonth) {
    const summaryStats = document.getElementById('summary-stats');
    
    summaryStats.innerHTML = `
        <div class="stat-card">
            <div class="stat-number new-number">${newCount}</div>
            <div class="stat-label">本月曾新增</div>
        </div>
        <div class="stat-card">
            <div class="stat-number removed-number">${removedCount}</div>
            <div class="stat-label">本月曾移除</div>
        </div>
        <div class="stat-card">
            <div class="stat-number continuing-number">${continuingCount}</div>
            <div class="stat-label">穩定持有</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalCount}</div>
            <div class="stat-label">${currentMonth} 月底總數</div>
        </div>
    `;
}

/**
 * 更新新納入股票列表
 */
function updateNewStocksList(addedStocks) {
    const container = document.getElementById('new-stocks-list');
    
    if (addedStocks.length === 0) {
        container.innerHTML = '<div class="no-data">本月份沒有新納入的成分股</div>';
        return;
    }
    
    // 按新增日期排序，再按權重
    const stockDetails = addedStocks.sort((a, b) => {
        if (a.changeDate < b.changeDate) return -1;
        if (a.changeDate > b.changeDate) return 1;
        return parseFloat(b['權重']) - parseFloat(a['權重']);
    });
    
    const stockList = document.createElement('div');
    stockList.className = 'stock-list';
    
    stockDetails.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.innerHTML = `
            <span class="stock-code">${stock['股票代號']}</span>
            <span class="stock-name">${stock['股票名稱']}</span>
            <span class="stock-weight">${stock['權重']}%</span>
            <span class="stock-date">新增於: ${stock.changeDate}</span>
        `;
        stockList.appendChild(stockItem);
    });
    
    container.innerHTML = '';
    container.appendChild(stockList);
}

/**
 * 更新移除股票列表
 */
function updateRemovedStocksList(removedStocks) {
    const container = document.getElementById('removed-stocks-list');
    
    if (removedStocks.length === 0) {
        container.innerHTML = '<div class="no-data">本月份沒有移除的成分股</div>';
        return;
    }
    
    // 按移除日期排序
    const stockDetails = removedStocks.sort((a, b) => {
        if (a.changeDate < b.changeDate) return -1;
        if (a.changeDate > b.changeDate) return 1;
        return 0;
    });
    
    const stockList = document.createElement('div');
    stockList.className = 'stock-list';
    
    stockDetails.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.innerHTML = `
            <span class="stock-code">${stock['股票代號']}</span>
            <span class="stock-name">${stock['股票名稱']}</span>
            <span class="stock-weight">${stock['權重']}% (移除前)</span>
            <span class="stock-date">移除於: ${stock.changeDate}</span>
        `;
        stockList.appendChild(stockItem);
    });
    
    container.innerHTML = '';
    container.appendChild(stockList);
}

/**
 * 更新持續持有股票列表（比較月初與月底的權重變化）
 */
function updateContinuingStocksList(continuingStocks, currentStockMap, prevStockMap) {
    const container = document.getElementById('continuing-stocks-list');
    
    if (continuingStocks.length === 0) {
        container.innerHTML = '<div class="no-data">沒有穩定持有的成分股</div>';
        return;
    }
    
    // 計算權重變化並排序
    const stockDetails = continuingStocks.map(code => {
        const current = currentStockMap.get(code);
        const prev = prevStockMap.get(code);
        
        if (!current || !prev) return null;
        
        const currentWeight = parseFloat(current['權重']) || 0;
        const prevWeight = parseFloat(prev['權重']) || 0;
        const weightChange = currentWeight - prevWeight;
        
        return {
            ...current,
            prevWeight,
            weightChange,
            weightChangeText: weightChange > 0 ? `+${weightChange.toFixed(2)}%` : 
                             weightChange < 0 ? `${weightChange.toFixed(2)}%` : '無變化'
        };
    })
    .filter(item => item)
    .sort((a, b) => Math.abs(b.weightChange) - Math.abs(a.weightChange)); // 按權重變化絕對值排序
    
    const stockList = document.createElement('div');
    stockList.className = 'stock-list';
    
    // 顯示前 20 個權重變化最大的股票
    stockDetails.slice(0, 20).forEach(stock => {
        const changeColor = stock.weightChange > 0 ? '#4CAF50' : 
                           stock.weightChange < 0 ? '#f44336' : '#666';
        
        const stockItem = document.createElement('div');
        stockItem.className = 'stock-item';
        stockItem.innerHTML = `
            <span class="stock-code">${stock['股票代號']}</span>
            <span class="stock-name">${stock['股票名稱']}</span>
            <span class="stock-weight">
                ${stock['權重']}% 
                <small style="color: ${changeColor};">(${stock.weightChangeText})</small>
            </span>
        `;
        stockList.appendChild(stockItem);
    });
    
    if (stockDetails.length > 20) {
        const moreInfo = document.createElement('div');
        moreInfo.style.textAlign = 'center';
        moreInfo.style.marginTop = '1rem';
        moreInfo.style.color = '#666';
        moreInfo.innerHTML = `... 還有 ${stockDetails.length - 20} 檔股票穩定持有`;
        stockList.appendChild(moreInfo);
    }
    
    container.innerHTML = '';
    container.appendChild(stockList);
}

// 匯出函式供其他模組使用
window.StockChangesAnalyzer = {
    loadStockData,
    selectMonth
};
