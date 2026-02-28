// Simple statistics that definitely works
document.addEventListener('DOMContentLoaded', function() {
    console.log('Statistics page loaded');
    
    // Only run on statistics page
    if (!document.getElementById('mainChart')) return;
    
    // Get database instance
    const db = new InvoiceDB();
    
    // Load invoices
    let invoices = db.getInvoices();
    console.log('Invoices loaded:', invoices);
    
    // If no invoices, create sample data
    if (invoices.length === 0) {
        console.log('Creating sample invoices for testing');
        
        const sampleInvoices = [
            {
                id: '1',
                invoiceNumber: '2024-INV-0001',
                date: '2024-02-01',
                customerName: 'ABC Enterprises',
                gstAmount: 180,
                subtotal: 1000,
                total: 1180
            },
            {
                id: '2',
                invoiceNumber: '2024-INV-0002',
                date: '2024-02-05',
                customerName: 'XYZ Traders',
                gstAmount: 360,
                subtotal: 2000,
                total: 2360
            },
            {
                id: '3',
                invoiceNumber: '2024-INV-0003',
                date: '2024-02-10',
                customerName: 'ABC Enterprises',
                gstAmount: 540,
                subtotal: 3000,
                total: 3540
            },
            {
                id: '4',
                invoiceNumber: '2024-INV-0004',
                date: '2024-02-15',
                customerName: 'PQR Solutions',
                gstAmount: 270,
                subtotal: 1500,
                total: 1770
            },
            {
                id: '5',
                invoiceNumber: '2024-INV-0005',
                date: '2024-02-20',
                customerName: 'LMN Industries',
                gstAmount: 450,
                subtotal: 2500,
                total: 2950
            }
        ];
        
        sampleInvoices.forEach(inv => db.saveInvoice(inv));
        invoices = db.getInvoices();
    }
    
    // Update summary cards
    updateSummaryCards(invoices);
    
    // Create initial chart
    let currentChart = createRevenueChart(invoices);
    
    // Setup chart type buttons
    const revenueBtn = document.querySelector('[data-chart="revenue"]');
    const countBtn = document.querySelector('[data-chart="count"]');
    const gstBtn = document.querySelector('[data-chart="gst"]');
    
    if (revenueBtn) {
        revenueBtn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (currentChart) currentChart.destroy();
            currentChart = createRevenueChart(invoices);
        });
    }
    
    if (countBtn) {
        countBtn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (currentChart) currentChart.destroy();
            currentChart = createCountChart(invoices);
        });
    }
    
    if (gstBtn) {
        gstBtn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (currentChart) currentChart.destroy();
            currentChart = createGSTChart(invoices);
        });
    }
    
    // Update button
    const updateBtn = document.getElementById('updateStats');
    if (updateBtn) {
        updateBtn.addEventListener('click', function() {
            invoices = db.getInvoices();
            updateSummaryCards(invoices);
            
            const activeBtn = document.querySelector('.chart-btn.active');
            if (activeBtn) {
                const chartType = activeBtn.dataset.chart;
                if (currentChart) currentChart.destroy();
                
                if (chartType === 'revenue') {
                    currentChart = createRevenueChart(invoices);
                } else if (chartType === 'count') {
                    currentChart = createCountChart(invoices);
                } else if (chartType === 'gst') {
                    currentChart = createGSTChart(invoices);
                }
            }
        });
    }
    
    // Update top customers
    updateTopCustomers(invoices);
});

function updateSummaryCards(invoices) {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalInvoices = invoices.length;
    const avgInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const highestInvoice = invoices.length > 0 ? Math.max(...invoices.map(inv => inv.total || 0)) : 0;
    
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('totalInvoices').textContent = totalInvoices;
    document.getElementById('avgInvoice').textContent = `₹${avgInvoice.toFixed(2)}`;
    document.getElementById('highestInvoice').textContent = `₹${highestInvoice.toFixed(2)}`;
}

function createRevenueChart(invoices) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // Prepare data - last 7 days
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        
        const dayInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.toDateString() === date.toDateString();
        });
        
        data.push(dayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0));
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

function createCountChart(invoices) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    // Prepare data - last 7 days
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        
        const dayInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.toDateString() === date.toDateString();
        });
        
        data.push(dayInvoices.length);
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

function createGSTChart(invoices) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    const totalGST = invoices.reduce((sum, inv) => sum + (inv.gstAmount || 0), 0);
    const totalSubtotal = invoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
    
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

function updateTopCustomers(invoices) {
    const customerMap = new Map();
    
    invoices.forEach(inv => {
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
    if (!tbody) return;
    
    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No customer data</td></tr>';
        return;
    }
    
    let html = '';
    sorted.forEach(([name, data]) => {
        html += `
            <tr>
                <td><strong>${name}</strong></td>
                <td style="text-align: center;">${data.count}</td>
                <td style="text-align: right; font-weight: bold;">₹${data.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}