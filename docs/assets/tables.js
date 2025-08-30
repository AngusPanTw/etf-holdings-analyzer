/**
 * 表格功能專用 JavaScript
 * 處理表格顯示、排序、篩選、分頁等功能
 */

// 表格相關變數
let allTableData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 50;
let currentSort = { field: '日期', direction: 'desc' };

/**
 * 初始化完整表格功能
 */
async function initializeFullTable() {
    console.log('📋 初始化完整表格...');
    
    try {
        // 載入所有資料
        allTableData = await window.ETFAnalyzer.loadAllData();
        filteredData = [...allTableData];
        
        // 初始化控制項
        initializeFilters();
        initializeTableEvents();
        
        // 顯示資料
        updateTable();
        updateRecordCount();
        
    } catch (error) {
        console.error('初始化表格時發生錯誤:', error);
        showTableError('載入資料時發生錯誤');
    }
}

/**
 * 初始化篩選控制項
 */
function initializeFilters() {
    // 初始化日期篩選
    const dateFilter = document.getElementById('dateFilter');
    const dates = window.ETFAnalyzer.getDateRange(allTableData);
    
    dateFilter.innerHTML = '<option value="">所有日期</option>';
    dates.all.reverse().forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
    });
    
    // 權重滑桿事件
    const weightFilter = document.getElementById('weightFilter');
    const weightValue = document.getElementById('weightValue');
    
    weightFilter.addEventListener('input', function() {
        weightValue.textContent = parseFloat(this.value).toFixed(1) + '%';
        debounceFilter();
    });
    
    // 股票搜尋事件
    const stockFilter = document.getElementById('stockFilter');
    stockFilter.addEventListener('input', debounceFilter);
    
    // 日期篩選事件
    dateFilter.addEventListener('change', applyFilters);
    
    // 重設按鈕
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // 匯出按鈕
    document.getElementById('exportData').addEventListener('click', exportData);
}

/**
 * 初始化表格事件
 */
function initializeTableEvents() {
    // 表頭排序事件
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const field = this.dataset.sort;
            handleSort(field);
        });
    });
}

/**
 * 防抖動篩選
 */
const debounceFilter = window.ETFAnalyzer.debounce(applyFilters, 300);

/**
 * 套用篩選條件
 */
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const stockFilter = document.getElementById('stockFilter').value.toLowerCase();
    const weightFilter = parseFloat(document.getElementById('weightFilter').value);
    
    filteredData = allTableData.filter(item => {
        // 日期篩選
        if (dateFilter && item['日期'] !== dateFilter) {
            return false;
        }
        
        // 股票篩選
        if (stockFilter) {
            const stockCode = item['股票代號'].toLowerCase();
            const stockName = item['股票名稱'].toLowerCase();
            if (!stockCode.includes(stockFilter) && !stockName.includes(stockFilter)) {
                return false;
            }
        }
        
        // 權重篩選
        const weight = parseFloat(item['權重']);
        if (weight < weightFilter) {
            return false;
        }
        
        return true;
    });
    
    // 重設到第一頁
    currentPage = 1;
    
    // 更新顯示
    updateTable();
    updateRecordCount();
    updatePagination();
}

/**
 * 重設篩選條件
 */
function resetFilters() {
    document.getElementById('dateFilter').value = '';
    document.getElementById('stockFilter').value = '';
    document.getElementById('weightFilter').value = '0';
    document.getElementById('weightValue').textContent = '0.0%';
    
    filteredData = [...allTableData];
    currentPage = 1;
    
    updateTable();
    updateRecordCount();
    updatePagination();
}

/**
 * 處理排序
 */
function handleSort(field) {
    if (currentSort.field === field) {
        // 切換排序方向
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // 新的排序欄位
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    // 更新視覺指示器
    updateSortIndicators();
    
    // 排序資料
    sortData();
    
    // 更新表格
    updateTable();
}

/**
 * 更新排序指示器
 */
function updateSortIndicators() {
    // 清除所有排序指示器
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('asc', 'desc');
    });
    
    // 設定當前排序指示器
    const currentHeader = document.querySelector(`[data-sort="${currentSort.field}"]`);
    if (currentHeader) {
        currentHeader.classList.add(currentSort.direction);
    }
}

/**
 * 排序資料
 */
function sortData() {
    filteredData.sort((a, b) => {
        let aValue = a[currentSort.field];
        let bValue = b[currentSort.field];
        
        // 處理數值欄位
        if (currentSort.field === '股數' || currentSort.field === '權重') {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
        }
        
        // 處理日期欄位
        if (currentSort.field === '日期') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (aValue < bValue) {
            return currentSort.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSort.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * 更新表格顯示
 */
function updateTable() {
    const tableBody = document.getElementById('tableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    if (pageData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="loading">📭 沒有符合條件的資料</td></tr>';
        return;
    }
    
    const tbody = pageData.map(item => {
        const weight = parseFloat(item['權重']);
        let weightClass = 'weight-low';
        if (weight >= 3) weightClass = 'weight-high';
        else if (weight >= 1) weightClass = 'weight-medium';
        
        return `
            <tr>
                <td>${item['日期']}</td>
                <td>${item['股票代號']}</td>
                <td>${item['股票名稱']}</td>
                <td>${window.ETFAnalyzer.formatNumber(item['股數'])}</td>
                <td class="${weightClass}">${item['權重']}%</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tbody;
    updatePagination();
}

/**
 * 更新記錄數量顯示
 */
function updateRecordCount() {
    const recordCount = document.getElementById('recordCount');
    recordCount.textContent = `總共 ${filteredData.length.toLocaleString()} 筆記錄`;
}

/**
 * 更新分頁控制項
 */
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            ← 上一頁
        </button>
    `;
    
    // 顯示頁碼
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            下一頁 →
        </button>
        <span class="page-info">第 ${currentPage} 頁，共 ${totalPages} 頁</span>
    `;
    
    pagination.innerHTML = html;
}

/**
 * 切換頁面
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updateTable();
}

/**
 * 匯出資料
 */
function exportData() {
    if (filteredData.length === 0) {
        alert('沒有資料可以匯出');
        return;
    }
    
    // 準備 CSV 內容
    const headers = ['日期', '股票代號', '股票名稱', '股數', '權重'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
            headers.map(header => 
                `"${row[header] || ''}"`
            ).join(',')
        )
    ].join('\n');
    
    // 建立下載連結
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ETF持股資料_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 顯示表格錯誤
 */
function showTableError(message) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = `<tr><td colspan="5" class="error">❌ ${message}</td></tr>`;
}

// 全域函式供 HTML 使用
window.changePage = changePage;
window.initializeFullTable = initializeFullTable;
