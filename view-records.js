class ViewRecords {
    constructor() {
        this.db = new InvoiceDB();
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.allInvoices = [];
        this.filteredInvoices = [];
        this.init();
    }
    
    init() {
        this.loadInvoices();
        this.setupEventListeners();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Search button
        document.getElementById('searchBtn')?.addEventListener('click', () => {
            this.searchInvoices();
        });
        
        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Enter key in search fields
        ['searchInvoice', 'searchCustomer', 'fromDate', 'toDate'].forEach(id => {
            document.getElementById(id)?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchInvoices();
                }
            });
        });
        
        // Close modals
        document.querySelectorAll('.view-close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('viewInvoiceModal').style.display = 'none';
            });
        });
        
        // Print button in modal
        document.getElementById('viewPrintBtn')?.addEventListener('click', () => {
            this.printCurrentInvoice();
        });
        
        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.getElementById('viewInvoiceModal').style.display = 'none';
            }
        });
    }
    
    loadInvoices() {
        this.allInvoices = this.db.getInvoices();
        
        // Sort by date (newest first)
        this.allInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.filteredInvoices = [...this.allInvoices];
        this.displayInvoices();
    }
    
    displayInvoices() {
        const tbody = document.getElementById('invoicesBody');
        const noRecords = document.getElementById('noRecords');
        const recordCount = document.getElementById('recordCount');
        
        if (!tbody) return;
        
        if (this.filteredInvoices.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
            if (recordCount) recordCount.textContent = '0 records';
            return;
        }
        
        if (noRecords) noRecords.style.display = 'none';
        if (recordCount) recordCount.textContent = `${this.filteredInvoices.length} records`;
        
        // Pagination
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedInvoices = this.filteredInvoices.slice(start, end);
        
        let html = '';
        paginatedInvoices.forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            
            html += `
                <tr>
                    <td><strong>${inv.invoiceNumber}</strong></td>
                    <td>${date}</td>
                    <td>${inv.customerName}</td>
                    <td>${inv.items.length}</td>
                    <td>₹${inv.subtotal.toFixed(2)}</td>
                    <td>₹${inv.gstAmount.toFixed(2)}</td>
                    <td><strong>₹${inv.total.toFixed(2)}</strong></td>
                    <td>
                        <button class="btn-icon" onclick="viewRecords.viewInvoice('${inv.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="viewRecords.printInvoice('${inv.id}')" title="Print">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-icon" onclick="viewRecords.deleteInvoice('${inv.id}')" title="Delete" style="color: #e74c3c;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        this.updatePagination();
    }
    
    searchInvoices() {
        const searchInvoice = document.getElementById('searchInvoice')?.value.toLowerCase().trim();
        const searchCustomer = document.getElementById('searchCustomer')?.value.toLowerCase().trim();
        const fromDate = document.getElementById('fromDate')?.value;
        const toDate = document.getElementById('toDate')?.value;
        
        this.filteredInvoices = this.allInvoices.filter(inv => {
            let match = true;
            
            // Filter by invoice number
            if (searchInvoice) {
                match = match && inv.invoiceNumber.toLowerCase().includes(searchInvoice);
            }
            
            // Filter by customer name
            if (searchCustomer) {
                match = match && inv.customerName.toLowerCase().includes(searchCustomer);
            }
            
            // Filter by date range
            if (fromDate) {
                match = match && new Date(inv.date) >= new Date(fromDate);
            }
            
            if (toDate) {
                const toDateObj = new Date(toDate);
                toDateObj.setHours(23, 59, 59);
                match = match && new Date(inv.date) <= toDateObj;
            }
            
            return match;
        });
        
        this.currentPage = 1;
        this.displayInvoices();
        this.updateStats();
    }
    
    resetFilters() {
        document.getElementById('searchInvoice').value = '';
        document.getElementById('searchCustomer').value = '';
        document.getElementById('fromDate').value = '';
        document.getElementById('toDate').value = '';
        
        this.filteredInvoices = [...this.allInvoices];
        this.currentPage = 1;
        this.displayInvoices();
        this.updateStats();
    }
    
    updateStats() {
        const totalInvoices = this.filteredInvoices.length;
        const totalRevenue = this.filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const avgInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        
        document.getElementById('totalInvoices').textContent = totalInvoices;
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
        document.getElementById('avgInvoice').textContent = `₹${avgInvoice.toFixed(2)}`;
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredInvoices.length / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (!pagination) return;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += `<button class="btn btn-secondary" ${this.currentPage === 1 ? 'disabled' : ''} onclick="viewRecords.goToPage(${this.currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                html += `<button class="btn btn-primary" style="background: #2c3e50;" disabled>${i}</button>`;
            } else {
                html += `<button class="btn btn-secondary" onclick="viewRecords.goToPage(${i})">${i}</button>`;
            }
        }
        
        // Next button
        html += `<button class="btn btn-secondary" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="viewRecords.goToPage(${this.currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        pagination.innerHTML = html;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.displayInvoices();
    }
    
    viewInvoice(id) {
        const invoice = this.db.getInvoiceById(id);
        if (!invoice) return;
        
        const previewHTML = this.generateInvoiceHTML(invoice);
        document.getElementById('viewInvoicePreview').innerHTML = previewHTML;
        document.getElementById('viewInvoiceModal').style.display = 'block';
    }
    
    printInvoice(id) {
        const invoice = this.db.getInvoiceById(id);
        if (!invoice) return;
        
        const previewHTML = this.generateInvoiceHTML(invoice);
        this.printInvoiceHTML(previewHTML, invoice.invoiceNumber);
    }
    
    printCurrentInvoice() {
        const printContent = document.getElementById('viewInvoicePreview').innerHTML;
        const invoiceNumber = document.querySelector('#viewInvoicePreview .invoice-number')?.textContent || 'invoice';
        this.printInvoiceHTML(printContent, invoiceNumber);
    }
    
    printInvoiceHTML(content, invoiceNumber) {
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoiceNumber}</title>
                <style>
                    body {
                        margin: 20px;
                        padding: 0;
                        background: white;
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 12px;
                    }
                    
                    .invoice-exact {
                        width: 100%;
                        background: white;
                    }
                    
                    .invoice-header-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                    }
                    
                    .company-details {
                        width: 60%;
                    }
                    
                    .company-name {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 3px;
                    }
                    
                    .company-subtitle {
                        font-size: 12px;
                        font-style: italic;
                        color: #666;
                        margin-bottom: 10px;
                    }
                    
                    .invoice-details {
                        width: 35%;
                        text-align: right;
                    }
                    
                    .invoice-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    
                    .items-table th {
                        background: #f5f5f5;
                        padding: 8px 6px;
                        border: 1px solid #000;
                        font-weight: bold;
                    }
                    
                    .items-table td {
                        padding: 8px 6px;
                        border: 1px solid #000;
                    }
                    
                    .totals-table {
                        width: 40%;
                        margin-left: auto;
                        margin-top: 15px;
                        border-collapse: collapse;
                    }
                    
                    .totals-table td {
                        padding: 8px 12px;
                        border: 1px solid #000;
                    }
                    
                    .totals-label {
                        background: #f5f5f5;
                        font-weight: bold;
                    }
                    
                    .totals-amount {
                        text-align: right;
                        font-weight: bold;
                    }
                    
                    .invoice-footer {
                        margin-top: 25px;
                        padding-top: 15px;
                        border-top: 1px solid #000;
                        text-align: center;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                ${content}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    generateInvoiceHTML(invoice) {
        // Format date
        const dateObj = new Date(invoice.date);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        // Generate item rows
        let itemsHTML = '';
        invoice.items.forEach((item, index) => {
            itemsHTML += `
                <tr>
                    <td class="col-sno">${index + 1}</td>
                    <td class="col-desc">${item.description}</td>
                    <td class="col-qty">${item.quantity}</td>
                    <td class="col-unit">${item.unitPrice.toFixed(2)}</td>
                    <td class="col-total">${item.total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        // Add empty rows
        const remainingRows = 10 - invoice.items.length;
        for (let i = 0; i < remainingRows; i++) {
            itemsHTML += `
                <tr>
                    <td class="col-sno"></td>
                    <td class="col-desc"></td>
                    <td class="col-qty"></td>
                    <td class="col-unit"></td>
                    <td class="col-total"></td>
                </tr>
            `;
        }
        
        // Format GST display
        const gstDisplay = invoice.gstNumber ? `GST No.: ${invoice.gstNumber}` : '';
        
        return `
            <div class="invoice-exact">
                <div class="invoice-header-container">
                    <div class="company-details">
                        <div class="company-name">DWARAKAMAI XEROX</div>
                        <div class="company-subtitle">and communication center</div>
                        <div class="company-address">
                            Sh. No. 58, Satya Surya Commercial Complex, Upstairs<br>
                            Tokyo Color Lab, Opp ANR Shopping Mall, 1<sup>st</sup> Lane,<br>
                            DWARAKANAGAR, Visakhapatnam-16
                        </div>
                        <div class="company-contact">
                            Phone: 9346371235<br>
                            Email: dwarakamaizerox@gmail.com
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <div class="invoice-title">INVOICE</div>
                        <div class="invoice-number">Invoice #${invoice.invoiceNumber}</div>
                        ${invoice.gstNumber ? `<div class="invoice-gst">${gstDisplay}</div>` : ''}
                        <div class="invoice-date">Date: ${formattedDate}</div>
                    </div>
                </div>
                
                <div class="bill-to-section">
                    <div class="bill-to-title">Bill To:</div>
                    <div class="customer-name">${invoice.customerName}</div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th class="col-sno">SNO.</th>
                            <th class="col-desc">DESCRIPTION</th>
                            <th class="col-qty">QUANTITY</th>
                            <th class="col-unit">UNIT PRICE</th>
                            <th class="col-total">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <table class="totals-table">
                    <tr>
                        <td class="totals-label">SUBTOTAL</td>
                        <td class="totals-amount">${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="totals-label">GST</td>
                        <td class="totals-amount">${invoice.gstAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="totals-label">Total</td>
                        <td class="totals-amount">${invoice.total.toFixed(2)}</td>
                    </tr>
                </table>
                
                <div class="invoice-footer">
                    Thank you for your business!
                </div>
            </div>
        `;
    }
    
    deleteInvoice(id) {
        if (confirm('Are you sure you want to delete this invoice?')) {
            this.db.deleteInvoice(id);
            this.loadInvoices();
            this.updateStats();
            alert('Invoice deleted successfully');
        }
    }
}

// Initialize
let viewRecords;
document.addEventListener('DOMContentLoaded', function() {
    viewRecords = new ViewRecords();
});