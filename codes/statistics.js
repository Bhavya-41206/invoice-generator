// statistics.js - Full functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Statistics page loaded');
    
    // Only run on statistics page
    if (!document.getElementById('mainChart')) return;
    
    // Get database instance
    const db = new InvoiceDB();
    
    // Load invoices
    let invoices = db.getInvoices();
    console.log('Invoices loaded:', invoices.length);
    
    // If no invoices, create sample data
    if (invoices.length === 0) {
        console.log('Creating sample invoices for testing');
        
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        const sampleInvoices = [
            // Today's invoices
            {
                id: '1',
                invoiceNumber: `${currentYear}-INV-0001`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(currentDay).padStart(2,'0')}`,
                customerName: 'Today Customer 1',
                gstAmount: 180,
                subtotal: 1000,
                total: 1180
            },
            {
                id: '2',
                invoiceNumber: `${currentYear}-INV-0002`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(currentDay).padStart(2,'0')}`,
                customerName: 'Today Customer 2',
                gstAmount: 360,
                subtotal: 2000,
                total: 2360
            },
            // Yesterday
            {
                id: '3',
                invoiceNumber: `${currentYear}-INV-0003`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(currentDay-1).padStart(2,'0')}`,
                customerName: 'Yesterday Customer',
                gstAmount: 540,
                subtotal: 3000,
                total: 3540
            },
            // This week
            {
                id: '4',
                invoiceNumber: `${currentYear}-INV-0004`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(currentDay-3).padStart(2,'0')}`,
                customerName: 'Week Customer',
                gstAmount: 270,
                subtotal: 1500,
                total: 1770
            },
            // Last week
            {
                id: '5',
                invoiceNumber: `${currentYear}-INV-0005`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-${String(currentDay-8).padStart(2,'0')}`,
                customerName: 'Last Week Customer',
                gstAmount: 450,
                subtotal: 2500,
                total: 2950
            },
            // This month
            {
                id: '6',
                invoiceNumber: `${currentYear}-INV-0006`,
                date: `${currentYear}-${String(currentMonth).padStart(2,'0')}-05`,
                customerName: 'Month Customer',
                gstAmount: 900,
                subtotal: 5000,
                total: 5900
            },
            // Last month
            {
                id: '7',
                invoiceNumber: `${currentYear}-INV-0007`,
                date: `${currentYear}-${String(currentMonth-1).padStart(2,'0')}-15`,
                customerName: 'Last Month Customer',
                gstAmount: 720,
                subtotal: 4000,
                total: 4720
            },
            // This year
            {
                id: '8',
                invoiceNumber: `${currentYear}-INV-0008`,
                date: `${currentYear}-02-10`,
                customerName: 'Year Customer',
                gstAmount: 1260,
                subtotal: 7000,
                total: 8260
            },
            // Last year
            {
                id: '9',
                invoiceNumber: `${currentYear-1}-INV-0001`,
                date: `${currentYear-1}-12-20`,
                customerName: 'Last Year Customer',
                gstAmount: 1800,
                subtotal: 10000,
                total: 11800
            }
        ];
        
        sampleInvoices.forEach(inv => db.saveInvoice(inv));
        invoices = db.getInvoices();
    }
    
    // State
    let selectedPeriod = 'today';
    let customFromDate = null;
    let customToDate = null;
    let groupBy = 'day';
    let currentChart = null;
    
    // DOM Elements
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    const groupBySelect = document.getElementById('groupBy');
    const today = new Date();
    
    // Set default to last 30 days
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    fromDateInput.value = lastMonth.toISOString().split('T')[0];
    toDateInput.value = today.toISOString().split('T')[0];
    
    // Get invoices for date range
    function getInvoicesForRange(from, to) {
        if (!from && !to) return invoices;
        
        const fromDate = from ? new Date(from) : new Date('2000-01-01');
        const toDate = to ? new Date(to) : new Date('2100-12-31');
        toDate.setHours(23, 59, 59);
        
        return invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= fromDate && invDate <= toDate;
        });
    }
    
    // Get invoices for preset period
    function getInvoicesForPeriod(period) {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Start of this week (Sunday)
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        // Start of last week
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(weekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
        
        // Start of this month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        // Start of last month
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        
        // Start of this year
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearStartStr = yearStart.toISOString().split('T')[0];
        
        // Start of last year
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        
        switch(period) {
            case 'today':
                customFromDate = todayStr;
                customToDate = todayStr;
                return invoices.filter(inv => inv.date === todayStr);
                
            case 'yesterday':
                customFromDate = yesterdayStr;
                customToDate = yesterdayStr;
                return invoices.filter(inv => inv.date === yesterdayStr);
                
            case 'thisweek':
                customFromDate = weekStartStr;
                customToDate = todayStr;
                return invoices.filter(inv => inv.date >= weekStartStr);
                
            case 'lastweek':
                customFromDate = lastWeekStart.toISOString().split('T')[0];
                customToDate = lastWeekEnd.toISOString().split('T')[0];
                return invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= lastWeekStart && invDate <= lastWeekEnd;
                });
                
            case 'thismonth':
                customFromDate = monthStartStr;
                customToDate = todayStr;
                return invoices.filter(inv => inv.date >= monthStartStr);
                
            case 'lastmonth':
                customFromDate = lastMonthStart.toISOString().split('T')[0];
                customToDate = lastMonthEnd.toISOString().split('T')[0];
                return invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= lastMonthStart && invDate <= lastMonthEnd;
                });
                
            case 'thisyear':
                customFromDate = yearStartStr;
                customToDate = todayStr;
                return invoices.filter(inv => inv.date >= yearStartStr);
                
            case 'lastyear':
                customFromDate = lastYearStart.toISOString().split('T')[0];
                customToDate = lastYearEnd.toISOString().split('T')[0];
                return invoices.filter(inv => {
                    const invDate = new Date(inv.date);
                    return invDate >= lastYearStart && invDate <= lastYearEnd;
                });
                
            default:
                return invoices;
        }
    }
    
    // Update all statistics
    function updateAllStats() {
        let periodInvoices;
        
        if (customFromDate || customToDate) {
            periodInvoices = getInvoicesForRange(customFromDate, customToDate);
            updateDateInputs();
        } else {
            periodInvoices = getInvoicesForPeriod(selectedPeriod);
        }
        
        updateSummaryCards(periodInvoices);
        updateRevenueBreakdown();
        updateTopTransactions(periodInvoices);
        updateCustomerBreakdown(periodInvoices);
        updateTopCustomers(periodInvoices);
        updateChart(periodInvoices);
    }
    
    // Update summary cards
    function updateSummaryCards(periodInvoices) {
        const totalRevenue = periodInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalInvoices = periodInvoices.length;
        const avgInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        const highestInvoice = periodInvoices.length > 0 
            ? Math.max(...periodInvoices.map(inv => inv.total || 0)) 
            : 0;
        
        // Find highest invoice details
        const highestInv = periodInvoices.find(inv => inv.total === highestInvoice);
        const highestDate = highestInv ? new Date(highestInv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
        
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('avgInvoice').textContent = `₹${avgInvoice.toFixed(2)}`;
        document.getElementById('highestInvoice').textContent = `₹${highestInvoice.toFixed(2)}`;
        document.getElementById('highestInvoiceDate').textContent = highestDate ? `on ${highestDate}` : '';
        
        // Update all time stats
        const allInvoices = invoices;
        const allRevenue = allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        document.getElementById('totalRevenueSub').textContent = `₹${allRevenue.toFixed(2)} all time`;
        document.getElementById('totalInvoicesSub').textContent = `${allInvoices.length} total`;
    }
    
    // Update revenue breakdown
    function updateRevenueBreakdown() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Get start of week
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        // Get start of month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        // Get start of year
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearStartStr = yearStart.toISOString().split('T')[0];
        
        // Calculate revenues
        let revenueToday = 0, revenueWeek = 0, revenueMonth = 0, revenueYear = 0;
        
        invoices.forEach(inv => {
            const invDate = inv.date;
            
            if (invDate === todayStr) revenueToday += inv.total || 0;
            if (invDate >= weekStartStr) revenueWeek += inv.total || 0;
            if (invDate >= monthStartStr) revenueMonth += inv.total || 0;
            if (invDate >= yearStartStr) revenueYear += inv.total || 0;
        });
        
        document.getElementById('revenueToday').textContent = `₹${revenueToday.toFixed(2)}`;
        document.getElementById('revenueWeek').textContent = `₹${revenueWeek.toFixed(2)}`;
        document.getElementById('revenueMonth').textContent = `₹${revenueMonth.toFixed(2)}`;
        document.getElementById('revenueYear').textContent = `₹${revenueYear.toFixed(2)}`;
    }
    
    // Update top transactions
    function updateTopTransactions(periodInvoices) {
        const sorted = [...periodInvoices].sort((a, b) => (b.total || 0) - (a.total || 0)).slice(0, 5);
        const container = document.getElementById('topTransactions');
        
        if (sorted.length === 0) {
            container.innerHTML = '<div class="detail-item"><span class="detail-label">No transactions</span><span class="detail-amount"></span></div>';
            return;
        }
        
        let html = '';
        sorted.forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            html += `
                <div class="detail-item">
                    <span class="detail-label">${inv.customerName} (${date})</span>
                    <span class="detail-amount">₹${(inv.total || 0).toFixed(2)}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Update customer breakdown
    function updateCustomerBreakdown(periodInvoices) {
        const uniqueCustomers = new Set(periodInvoices.map(inv => inv.customerName)).size;
        const totalRevenue = periodInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const avgPerCustomer = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
        
        // Find top customer
        const customerMap = new Map();
        periodInvoices.forEach(inv => {
            const name = inv.customerName;
            if (customerMap.has(name)) {
                customerMap.set(name, customerMap.get(name) + (inv.total || 0));
            } else {
                customerMap.set(name, inv.total || 0);
            }
        });
        
        let topCustomer = '-';
        let topAmount = 0;
        customerMap.forEach((amount, name) => {
            if (amount > topAmount) {
                topAmount = amount;
                topCustomer = name;
            }
        });
        
        document.getElementById('uniqueCustomers').textContent = uniqueCustomers;
        document.getElementById('avgPerCustomer').textContent = `₹${avgPerCustomer.toFixed(2)}`;
        document.getElementById('topCustomer').textContent = topCustomer;
    }
    
    // Update top customers table
    function updateTopCustomers(periodInvoices) {
        const customerMap = new Map();
        
        periodInvoices.forEach(inv => {
            const name = inv.customerName || 'Unknown';
            if (customerMap.has(name)) {
                const data = customerMap.get(name);
                data.count += 1;
                data.total += inv.total || 0;
            } else {
                customerMap.set(name, { count: 1, total: inv.total || 0 });
            }
        });
        
        const sorted = Array.from(customerMap.entries())
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 5);
        
        const tbody = document.getElementById('topCustomers');
        
        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-data"><i class="fas fa-users"></i><p>No customer data available</p></td></tr>';
            return;
        }
        
        let html = '';
        sorted.forEach(([name, data]) => {
            html += `
                <tr>
                    <td><strong>${name}</strong></td>
                    <td>${data.count}</td>
                    <td style="font-weight: 600; color: var(--success);">₹${data.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    }
    
    // Update chart
    function updateChart(periodInvoices) {
        const activeBtn = document.querySelector('.chart-btn.active');
        if (!activeBtn) return;
        
        if (currentChart) currentChart.destroy();
        
        const chartType = activeBtn.dataset.chart;
        groupBy = groupBySelect.value;
        
        if (chartType === 'revenue') {
            currentChart = createRevenueChart(periodInvoices);
        } else if (chartType === 'count') {
            currentChart = createCountChart(periodInvoices);
        } else if (chartType === 'gst') {
            currentChart = createGSTChart(periodInvoices);
        }
    }
    
    // Create revenue chart
    function createRevenueChart(periodInvoices) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        let labels = [];
        let data = [];
        
        if (groupBy === 'day') {
            const dateMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = inv.date;
                if (dateMap.has(date)) {
                    dateMap.set(date, dateMap.get(date) + (inv.total || 0));
                } else {
                    dateMap.set(date, inv.total || 0);
                }
            });
            
            const sortedDates = Array.from(dateMap.keys()).sort();
            labels = sortedDates.map(d => {
                const date = new Date(d);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            });
            data = sortedDates.map(d => dateMap.get(d));
            
        } else if (groupBy === 'week') {
            const weekMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const weekNum = Math.ceil(date.getDate() / 7);
                const key = `Week ${weekNum}`;
                
                if (weekMap.has(key)) {
                    weekMap.set(key, weekMap.get(key) + (inv.total || 0));
                } else {
                    weekMap.set(key, inv.total || 0);
                }
            });
            
            labels = Array.from(weekMap.keys()).sort();
            data = labels.map(l => weekMap.get(l));
            
        } else if (groupBy === 'month') {
            const monthMap = new Map();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const key = months[date.getMonth()];
                
                if (monthMap.has(key)) {
                    monthMap.set(key, monthMap.get(key) + (inv.total || 0));
                } else {
                    monthMap.set(key, inv.total || 0);
                }
            });
            
            labels = months.filter(m => monthMap.has(m));
            data = labels.map(l => monthMap.get(l) || 0);
            
        } else if (groupBy === 'year') {
            const yearMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const key = date.getFullYear().toString();
                
                if (yearMap.has(key)) {
                    yearMap.set(key, yearMap.get(key) + (inv.total || 0));
                } else {
                    yearMap.set(key, inv.total || 0);
                }
            });
            
            labels = Array.from(yearMap.keys()).sort();
            data = labels.map(l => yearMap.get(l));
        }
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue (₹)',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => '₹' + context.raw.toFixed(2)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '₹' + value
                        }
                    }
                }
            }
        });
    }
    
    // Create count chart
    function createCountChart(periodInvoices) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        let labels = [];
        let data = [];
        
        if (groupBy === 'day') {
            const countMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = inv.date;
                if (countMap.has(date)) {
                    countMap.set(date, countMap.get(date) + 1);
                } else {
                    countMap.set(date, 1);
                }
            });
            
            const sortedDates = Array.from(countMap.keys()).sort();
            labels = sortedDates.map(d => {
                const date = new Date(d);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            });
            data = sortedDates.map(d => countMap.get(d));
            
        } else if (groupBy === 'week') {
            const weekMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const weekNum = Math.ceil(date.getDate() / 7);
                const key = `Week ${weekNum}`;
                
                if (weekMap.has(key)) {
                    weekMap.set(key, weekMap.get(key) + 1);
                } else {
                    weekMap.set(key, 1);
                }
            });
            
            labels = Array.from(weekMap.keys()).sort();
            data = labels.map(l => weekMap.get(l));
            
        } else if (groupBy === 'month') {
            const monthMap = new Map();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const key = months[date.getMonth()];
                
                if (monthMap.has(key)) {
                    monthMap.set(key, monthMap.get(key) + 1);
                } else {
                    monthMap.set(key, 1);
                }
            });
            
            labels = months.filter(m => monthMap.has(m));
            data = labels.map(l => monthMap.get(l) || 0);
            
        } else if (groupBy === 'year') {
            const yearMap = new Map();
            
            periodInvoices.forEach(inv => {
                const date = new Date(inv.date);
                const key = date.getFullYear().toString();
                
                if (yearMap.has(key)) {
                    yearMap.set(key, yearMap.get(key) + 1);
                } else {
                    yearMap.set(key, 1);
                }
            });
            
            labels = Array.from(yearMap.keys()).sort();
            data = labels.map(l => yearMap.get(l));
        }
        
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Invoices',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => context.raw + ' invoice' + (context.raw !== 1 ? 's' : '')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
    
    // Create GST chart
    function createGSTChart(periodInvoices) {
        const ctx = document.getElementById('mainChart').getContext('2d');
        
        const totalGST = periodInvoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0);
        const totalSubtotal = periodInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Subtotal', 'GST'],
                datasets: [{
                    data: [totalSubtotal, totalGST],
                    backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
                    borderColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = totalSubtotal + totalGST;
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return context.label + ': ₹' + context.raw.toFixed(2) + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Update date inputs
    function updateDateInputs() {
        if (customFromDate) fromDateInput.value = customFromDate;
        if (customToDate) toDateInput.value = customToDate;
    }
    
    // Setup preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            selectedPeriod = this.dataset.preset;
            customFromDate = null;
            customToDate = null;
            updateAllStats();
        });
    });
    
    // Apply custom date range
    document.getElementById('applyDates').addEventListener('click', function() {
        customFromDate = fromDateInput.value;
        customToDate = toDateInput.value;
        
        if (!customFromDate || !customToDate) {
            alert('Please select both From and To dates');
            return;
        }
        
        if (new Date(customFromDate) > new Date(customToDate)) {
            alert('From date cannot be after To date');
            return;
        }
        
        // Deactivate all presets
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        selectedPeriod = 'custom';
        
        updateAllStats();
    });
    
    // Clear custom dates
    document.getElementById('clearDates').addEventListener('click', function() {
        customFromDate = null;
        customToDate = null;
        fromDateInput.value = '';
        toDateInput.value = '';
        
        // Reset to today
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-preset="today"]').classList.add('active');
        selectedPeriod = 'today';
        
        updateAllStats();
    });
    
    // Group by change
    groupBySelect.addEventListener('change', function() {
        groupBy = this.value;
        updateAllStats();
    });
    
    // Chart type buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateAllStats();
        });
    });
    
    // Initial update
    updateAllStats();
});