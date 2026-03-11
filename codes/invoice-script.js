// Simple modal control functions
function openModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

class InvoiceFormExact {
    constructor() {
        this.db = new InvoiceDB();
        this.itemCounter = 1;
        this.setupKeyboardShortcuts();
    }
    
    init() {
        this.setupEventListeners();
        this.addItemRow();
        this.updateInvoiceNumber();
        this.setCurrentDate();
        this.focusCustomerName();
    }
    
    setupEventListeners() {
        // Add item button
        document.getElementById('addItemBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.addItemRow();
        });
        
        // Calculate totals on input
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('item-input')) {
                this.calculateItemTotal(e.target.closest('tr'));
                this.calculateTotals();
            }
        });
        
        // GST percentage change
        document.getElementById('gstPercent')?.addEventListener('input', () => {
            this.calculateTotals();
        });
        
        // Preview button
        document.getElementById('previewBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.generatePreview();
        });
        
        // Save button
        document.getElementById('saveBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveInvoice();
        });
        
        // Print button
        document.getElementById('printBtn')?.addEventListener('click', () => {
            this.printInvoice();
        });
        
        // Close preview buttons
        document.getElementById('closePreview')?.addEventListener('click', closeModal);
        document.getElementById('closePreview2')?.addEventListener('click', closeModal);
        
        // Close modal when clicking on overlay
        document.getElementById('previewModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'previewModal') {
                closeModal();
            }
        });
        
        // Tab navigation for items
        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('item-input')) {
                this.handleItemNavigation(e);
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when user is typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Ctrl + N: New Invoice (Reset form)
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                if (confirm('Create new invoice? Current data will be lost.')) {
                    this.resetForm();
                }
            }
            
            // Ctrl + S: Save Invoice
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveInvoice();
            }
            
            // Ctrl + P: Preview Invoice
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                this.generatePreview();
            }
            
            // Ctrl + I: Add Item
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.addItemRow();
            }
            
            // F1: Focus Customer Name
            if (e.key === 'F1') {
                e.preventDefault();
                this.focusCustomerName();
            }
            
            // F2: Focus GST Number
            if (e.key === 'F2') {
                e.preventDefault();
                this.focusGSTNumber();
            }
            
            // F5: Calculate Totals
            if (e.key === 'F5') {
                e.preventDefault();
                this.calculateTotals();
            }
            
            // Escape: Close modal if open
            if (e.key === 'Escape') {
                if (document.getElementById('previewModal')?.style.display === 'block') {
                    closeModal();
                }
            }
        });
    }
    
    handleItemNavigation(e) {
        const input = e.target;
        const row = input.closest('tr');
        const inputs = Array.from(row.querySelectorAll('.item-input'));
        const currentIndex = inputs.indexOf(input);
        
        // Enter key: Move to next input in same row
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
                inputs[currentIndex + 1].select();
            } else {
                // If on last input of row, add new row
                this.addItemRow();
            }
        }
        
        // Tab key with Ctrl: Add new row
        if (e.key === 'Tab' && e.ctrlKey) {
            e.preventDefault();
            this.addItemRow();
        }
        
        // Arrow Down: Move to same input in next row
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                const nextInputs = Array.from(nextRow.querySelectorAll('.item-input'));
                if (nextInputs[currentIndex]) {
                    nextInputs[currentIndex].focus();
                    nextInputs[currentIndex].select();
                }
            }
        }
        
        // Arrow Up: Move to same input in previous row
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                const prevInputs = Array.from(prevRow.querySelectorAll('.item-input'));
                if (prevInputs[currentIndex]) {
                    prevInputs[currentIndex].focus();
                    prevInputs[currentIndex].select();
                }
            }
        }
        
        // Ctrl + D: Duplicate current row
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            this.duplicateRow(row);
        }
        
        // Ctrl + Delete: Delete current row
        if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
            e.preventDefault();
            if (document.querySelectorAll('#itemsBody tr').length > 1) {
                row.remove();
                this.renumberItems();
                this.calculateTotals();
                
                // Focus on previous row's description
                const prevRow = row.previousElementSibling;
                if (prevRow) {
                    prevRow.querySelector('.item-desc').focus();
                }
            }
        }
    }
    
    duplicateRow(row) {
        const newRow = row.cloneNode(true);
        const tbody = document.getElementById('itemsBody');
        
        // Clear the values in duplicated row (except description which might be useful to keep)
        newRow.querySelectorAll('.item-input').forEach(input => {
            if (input.classList.contains('item-desc')) {
                // Keep description but add "Copy" suffix
                input.value = input.value + ' (Copy)';
            } else if (input.classList.contains('item-qty')) {
                input.value = '1';
            } else if (input.classList.contains('item-price')) {
                input.value = '0.00';
            }
        });
        
        // Recalculate total for new row
        this.calculateItemTotal(newRow);
        
        // Insert after current row
        row.parentNode.insertBefore(newRow, row.nextSibling);
        
        // Renumber items
        this.renumberItems();
        
        // Recalculate totals
        this.calculateTotals();
        
        // Focus on description of duplicated row
        newRow.querySelector('.item-desc').focus();
        newRow.querySelector('.item-desc').select();
    }
    
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = today;
    }
    
    updateInvoiceNumber() {
        const invoiceNumber = this.db.generateInvoiceNumber();
        document.getElementById('invoiceNumber').value = invoiceNumber;
    }
    
    addItemRow() {
        const tbody = document.getElementById('itemsBody');
        if (!tbody) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 8%; text-align: center; font-weight: bold;">${this.itemCounter}</td>
            <td style="width: 52%">
                <input type="text" class="item-input item-desc" placeholder="Item description"
                       style="width: 100%; padding: 6px; border: 1px solid #ddd; font-family: Arial, sans-serif;">
            </td>
            <td style="width: 12%">
                <input type="number" class="item-input item-qty" value="1" min="1" step="1"
                       style="width: 100%; padding: 6px; border: 1px solid #ddd; text-align: right; font-family: Arial, sans-serif;">
            </td>
            <td style="width: 14%">
                <input type="number" class="item-input item-price" value="0.00" min="0" step="0.01"
                       style="width: 100%; padding: 6px; border: 1px solid #ddd; text-align: right; font-family: Arial, sans-serif;">
            </td>
            <td style="width: 14%; text-align: right; font-weight: bold; padding: 6px;" class="total-cell">0.00</td>
            <td style="width: 10%; text-align: center;">
                <button type="button" class="remove-btn" onclick="invoiceForm.removeItem(this)" title="Delete row (Ctrl+Delete)">
                    ✕
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        this.itemCounter++;
        
        // Auto-focus on description input of new row
        setTimeout(() => {
            const descInput = row.querySelector('.item-desc');
            if (descInput) {
                descInput.focus();
                descInput.select();
            }
        }, 10);
    }
    
    removeItem(button) {
        const row = button.closest('tr');
        if (row && document.querySelectorAll('#itemsBody tr').length > 1) {
            row.remove();
            this.renumberItems();
            this.calculateTotals();
            
            // Focus on previous row's description
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                const descInput = prevRow.querySelector('.item-desc');
                if (descInput) {
                    setTimeout(() => {
                        descInput.focus();
                        descInput.select();
                    }, 10);
                }
            }
        }
    }
    
    renumberItems() {
        const rows = document.querySelectorAll('#itemsBody tr');
        rows.forEach((row, index) => {
            row.querySelector('td:first-child').textContent = index + 1;
        });
        this.itemCounter = rows.length + 1;
    }
    
    calculateItemTotal(row) {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = qty * price;
        row.querySelector('.total-cell').textContent = total.toFixed(2);
    }
    
    calculateTotals() {
        let subtotal = 0;
        const rows = document.querySelectorAll('#itemsBody tr');
        
        rows.forEach(row => {
            const total = parseFloat(row.querySelector('.total-cell').textContent) || 0;
            subtotal += total;
        });
        
        const gstPercent = parseFloat(document.getElementById('gstPercent')?.value) || 18;
        const gstAmount = (subtotal * gstPercent) / 100;
        const totalAmount = subtotal + gstAmount;
        
        // Update display
        document.getElementById('subtotalDisplay').textContent = subtotal.toFixed(2);
        document.getElementById('gstAmountDisplay').textContent = gstAmount.toFixed(2);
        document.getElementById('totalAmountDisplay').textContent = totalAmount.toFixed(2);
        
        // Update hidden inputs
        document.getElementById('subtotalValue').value = subtotal;
        document.getElementById('gstValue').value = gstAmount;
        document.getElementById('totalValue').value = totalAmount;
    }
    
    focusCustomerName() {
        const customerNameInput = document.getElementById('customerName');
        if (customerNameInput) {
            customerNameInput.focus();
            customerNameInput.select();
        }
    }
    
    focusGSTNumber() {
        const gstNumberInput = document.getElementById('gstNumber');
        if (gstNumberInput) {
            gstNumberInput.focus();
            gstNumberInput.select();
        }
    }
    
    generatePreview() {
        // Validate
        const customerName = document.getElementById('customerName')?.value.trim();
        if (!customerName) {
            alert('Please enter customer name');
            this.focusCustomerName();
            return;
        }
        
        // Get items
        const items = [];
        const rows = document.querySelectorAll('#itemsBody tr');
        let hasItems = false;
        
        rows.forEach(row => {
            const desc = row.querySelector('.item-desc').value.trim();
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            if (desc && qty && price) {
                hasItems = true;
                items.push({
                    description: desc,
                    quantity: parseFloat(qty),
                    unitPrice: parseFloat(price),
                    total: (parseFloat(qty) * parseFloat(price)).toFixed(2)
                });
            }
        });
        
        if (!hasItems) {
            alert('Please add at least one item');
            // Focus on first item's description
            const firstDescInput = document.querySelector('#itemsBody tr:first-child .item-desc');
            if (firstDescInput) {
                firstDescInput.focus();
                firstDescInput.select();
            }
            return;
        }
        
        // Get form values
        const customerDesc = document.getElementById('customerDesc')?.value.trim() || '';
        const invoiceNumber = document.getElementById('invoiceNumber')?.value;
        const gstNumber = document.getElementById('gstNumber')?.value || '';
        const invoiceDate = document.getElementById('invoiceDate')?.value;
        const gstPercent = document.getElementById('gstPercent')?.value || 18;
        
        // Format date
        const dateObj = new Date(invoiceDate);
        const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        // Calculate totals
        const subtotal = parseFloat(document.getElementById('subtotalValue')?.value) || 0;
        const gstAmount = parseFloat(document.getElementById('gstValue')?.value) || 0;
        const total = parseFloat(document.getElementById('totalValue')?.value) || 0;
        
        // Generate preview HTML with side-by-side layout
        const previewHTML = this.generateInvoiceHTML(
            customerName,
            customerDesc,
            invoiceNumber,
            gstNumber,
            formattedDate,
            gstPercent,
            items,
            subtotal,
            gstAmount,
            total
        );
        
        document.getElementById('invoicePreview').innerHTML = previewHTML;
        
        // Open modal
        openModal();
    }
    
    generateInvoiceHTML(customerName, customerDesc, invoiceNumber, gstNumber, 
                       formattedDate, gstPercent, items, subtotal, gstAmount, total) {
        
        // Generate item rows
        let itemsHTML = '';
        items.forEach((item, index) => {
            itemsHTML += `
                <tr>
                    <td class="col-sno">${index + 1}</td>
                    <td class="col-desc">${item.description}</td>
                    <td class="col-qty">${item.quantity}</td>
                    <td class="col-unit">${item.unitPrice.toFixed(2)}</td>
                    <td class="col-total">${item.total}</td>
                </tr>
            `;
        });
        
        // Add empty rows for formatting
        const remainingRows = 10 - items.length;
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
        
        // Format GST number display
        const gstDisplay = gstNumber ? `GST No.: ${gstNumber}` : '';
        
        return `
            <div class="invoice-exact">
                <!-- Header with side-by-side layout -->
                <div class="invoice-header-container">
                    <!-- Company details on left -->
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
                    
                    <!-- Invoice details on right -->
                    <div class="invoice-details">
                        <div class="invoice-title">INVOICE</div>
                        <div class="invoice-number">Invoice #${invoiceNumber}</div>
                        ${gstNumber ? `<div class="invoice-gst">${gstDisplay}</div>` : ''}
                        <div class="invoice-date">Date: ${formattedDate}</div>
                    </div>
                </div>
                
                <!-- Bill To -->
                <div class="bill-to-section">
                    <div class="bill-to-title">Bill To:</div>
                    <div class="customer-name">${customerName}</div>
                </div>
                
                <!-- Items Table -->
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
                
                <!-- Totals -->
                <table class="totals-table">
                    <tr>
                        <td class="totals-label">SUBTOTAL</td>
                        <td class="totals-amount">${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="totals-label">GST</td>
                        <td class="totals-amount">${gstAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="totals-label">Total</td>
                        <td class="totals-amount">${total.toFixed(2)}</td>
                    </tr>
                </table>
                
                <!-- Footer -->
                <div class="invoice-footer">
                    Thank you for your business!
                </div>
            </div>
        `;
    }
    
    printInvoice() {
        const printContent = document.getElementById('invoicePreview').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${document.getElementById('invoiceNumber')?.value}</title>
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
                    
                    .company-address, .company-contact {
                        font-size: 11px;
                        line-height: 1.4;
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
                    
                    .invoice-number, .invoice-gst, .invoice-date {
                        font-size: 11px;
                        margin: 2px 0;
                        font-weight: bold;
                    }
                    
                    .bill-to-section {
                        margin: 15px 0;
                        padding: 12px;
                        border-top: 1px solid #000;
                        border-bottom: 1px solid #000;
                    }
                    
                    .bill-to-title {
                        font-size: 13px;
                        font-weight: bold;
                        margin-bottom: 5px;
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
                    
                    @media print {
                        body {
                            margin: 0;
                            padding: 15px;
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent}
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
    
    saveInvoice() {
        // Validate
        const customerName = document.getElementById('customerName')?.value.trim();
        if (!customerName) {
            alert('Please enter customer name');
            this.focusCustomerName();
            return;
        }
        
        // Get items
        const items = [];
        const rows = document.querySelectorAll('#itemsBody tr');
        
        rows.forEach(row => {
            const desc = row.querySelector('.item-desc').value.trim();
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            if (desc && qty && price) {
                items.push({
                    sno: row.querySelector('td:first-child').textContent,
                    description: desc,
                    quantity: parseFloat(qty),
                    unitPrice: parseFloat(price),
                    total: parseFloat(qty) * parseFloat(price)
                });
            }
        });
        
        if (items.length === 0) {
            alert('Please add at least one item');
            const firstDescInput = document.querySelector('#itemsBody tr:first-child .item-desc');
            if (firstDescInput) {
                firstDescInput.focus();
                firstDescInput.select();
            }
            return;
        }
        
        // Create invoice
        const invoice = {
            id: Date.now().toString(),
            invoiceNumber: document.getElementById('invoiceNumber')?.value,
            date: document.getElementById('invoiceDate')?.value,
            customerName: customerName,
            customerDesc: document.getElementById('customerDesc')?.value.trim() || '',
            gstNumber: document.getElementById('gstNumber')?.value || '',
            gstPercentage: parseFloat(document.getElementById('gstPercent')?.value) || 18,
            items: items,
            subtotal: parseFloat(document.getElementById('subtotalValue')?.value),
            gstAmount: parseFloat(document.getElementById('gstValue')?.value),
            total: parseFloat(document.getElementById('totalValue')?.value),
            createdAt: new Date().toISOString()
        };
        
        // Save
        this.db.saveInvoice(invoice);
        
        alert(`Invoice #${invoice.invoiceNumber} saved successfully!\nTotal: ₹${invoice.total.toFixed(2)}`);
        this.resetForm();
    }
    
    resetForm() {
        document.getElementById('customerName').value = '';
        document.getElementById('customerDesc').value = '';
        document.getElementById('gstNumber').value = '';
        document.getElementById('gstPercent').value = '18';
        document.getElementById('itemsBody').innerHTML = '';
        this.itemCounter = 1;
        this.addItemRow();
        this.updateInvoiceNumber();
        this.calculateTotals();
        this.focusCustomerName();
    }
}

// Initialize
let invoiceForm;
document.addEventListener('DOMContentLoaded', function() {
    invoiceForm = new InvoiceFormExact();
    invoiceForm.init();
    
    // Add keyboard shortcut help tooltip
    addKeyboardShortcutHelp();
});

// Function to add keyboard shortcut help
function addKeyboardShortcutHelp() {
    const helpHTML = `
        <div id="keyboardHelp" style="position: fixed; bottom: 20px; right: 20px; background: #2c3e50; color: white; padding: 15px; border-radius: 8px; font-size: 12px; z-index: 1000; display: none; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Keyboard Shortcuts</strong>
                <button onclick="document.getElementById('keyboardHelp').style.display='none'" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><kbd>Ctrl+N</kbd></div><div>New Invoice</div>
                <div><kbd>Ctrl+S</kbd></div><div>Save Invoice</div>
                <div><kbd>Ctrl+P</kbd></div><div>Preview</div>
                <div><kbd>Ctrl+I</kbd></div><div>Add Item</div>
                <div><kbd>F1</kbd></div><div>Focus Customer</div>
                <div><kbd>F2</kbd></div><div>Focus GST</div>
                <div><kbd>F5</kbd></div><div>Calculate</div>
                <div><kbd>Enter</kbd></div><div>Next Field</div>
                <div><kbd>Ctrl+Enter</kbd></div><div>New Row</div>
                <div><kbd>Ctrl+D</kbd></div><div>Duplicate Row</div>
                <div><kbd>Ctrl+Del</kbd></div><div>Delete Row</div>
                <div><kbd>↑/↓</kbd></div><div>Navigate Rows</div>
                <div><kbd>?</kbd></div><div>Toggle Help</div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', helpHTML);
    
    // Toggle help with ? key
    document.addEventListener('keydown', (e) => {
        if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const helpDiv = document.getElementById('keyboardHelp');
            if (helpDiv) {
                helpDiv.style.display = helpDiv.style.display === 'none' ? 'block' : 'none';
            }
        }
        
        // Ctrl+/ also toggles help
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const helpDiv = document.getElementById('keyboardHelp');
            if (helpDiv) {
                helpDiv.style.display = helpDiv.style.display === 'none' ? 'block' : 'none';
            }
        }
    });
    
    // Auto-hide help after 10 seconds
    setTimeout(() => {
        const helpDiv = document.getElementById('keyboardHelp');
        if (helpDiv) {
            helpDiv.style.display = 'none';
        }
    }, 10000);
}