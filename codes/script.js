// Database simulation using localStorage
class InvoiceDB {
    constructor() {
        this.INVOICES_KEY = 'dwarakamai_invoices';
        this.USERS_KEY = 'dwarakamai_users';
        this.CURRENT_USER_KEY = 'dwarakamai_current_user';
        this.initDB();
    }
    
    initDB() {
        // Initialize users if not exists
        if (!localStorage.getItem(this.USERS_KEY)) {
            const defaultUsers = [
                { username: 'admin', password: 'password123', email: 'admin@dwarakamai.com' }
            ];
            localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
        }
        
        // Initialize invoices if not exists
        if (!localStorage.getItem(this.INVOICES_KEY)) {
            localStorage.setItem(this.INVOICES_KEY, JSON.stringify([]));
        }
    }
    
    // User management
    authenticate(username, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY));
        const user = users.find(u => u.username === username && u.password === password);
        return user ? { username: user.username, email: user.email } : null;
    }
    
    setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    }
    
    getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }
    
    clearCurrentUser() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    
    // Invoice management
    saveInvoice(invoice) {
        const invoices = JSON.parse(localStorage.getItem(this.INVOICES_KEY));
        invoices.push(invoice);
        localStorage.setItem(this.INVOICES_KEY, JSON.stringify(invoices));
        return invoice;
    }
    
    getInvoices() {
        return JSON.parse(localStorage.getItem(this.INVOICES_KEY));
    }
    
    getInvoiceById(id) {
        const invoices = this.getInvoices();
        return invoices.find(inv => inv.id === id);
    }
    
    getInvoicesByDateRange(startDate, endDate) {
        const invoices = this.getInvoices();
        return invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate >= new Date(startDate) && invDate <= new Date(endDate);
        });
    }
    
    deleteInvoice(id) {
        const invoices = this.getInvoices();
        const filtered = invoices.filter(inv => inv.id !== id);
        localStorage.setItem(this.INVOICES_KEY, JSON.stringify(filtered));
        return filtered;
    }
    
    generateInvoiceNumber() {
        const invoices = this.getInvoices();
        const currentYear = new Date().getFullYear();
        
        // Get all invoice numbers for current year
        const yearInvoices = invoices.filter(inv => {
            const invYear = new Date(inv.date).getFullYear();
            return invYear === currentYear;
        });
        
        // Find the highest invoice number for this year
        let maxNumber = 0;
        yearInvoices.forEach(inv => {
            if (inv.invoiceNumber && inv.invoiceNumber.startsWith(currentYear)) {
                const parts = inv.invoiceNumber.split('-');
                if (parts.length === 3) {
                    const num = parseInt(parts[2]);
                    if (!isNaN(num) && num > maxNumber) {
                        maxNumber = num;
                    }
                }
            }
        });
        
        // Generate new invoice number: YYYY-INV-XXXX
        const newNumber = String(maxNumber + 1).padStart(4, '0');
        return `${currentYear}-INV-${newNumber}`;
    }
    
    // Statistics
    getStatistics(timeframe = 'monthly') {
        const invoices = this.getInvoices();
        const now = new Date();
        let filtered = [];
        
        switch(timeframe) {
            case 'daily':
                const today = new Date().toISOString().split('T')[0];
                filtered = invoices.filter(inv => inv.date === today);
                break;
            case 'weekly':
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filtered = invoices.filter(inv => new Date(inv.date) >= oneWeekAgo);
                break;
            case 'monthly':
                const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filtered = invoices.filter(inv => new Date(inv.date) >= oneMonthAgo);
                break;
            case 'yearly':
                const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                filtered = invoices.filter(inv => new Date(inv.date) >= oneYearAgo);
                break;
            default:
                filtered = invoices;
        }
        
        const total = filtered.reduce((sum, inv) => sum + inv.total, 0);
        const count = filtered.length;
        const avg = count > 0 ? total / count : 0;
        
        return {
            total,
            count,
            avg,
            invoices: filtered
        };
    }
}

// Initialize database
const db = new InvoiceDB();

// Login functionality
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const rememberMe = document.getElementById('rememberMe');
    
    // Check for saved credentials
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
        document.getElementById('username').value = savedUsername;
        rememberMe.checked = true;
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = db.authenticate(username, password);
        
        if (user) {
            // Save credentials if remember me is checked
            if (rememberMe.checked) {
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('savedUsername');
            }
            
            // Set current user and redirect
            db.setCurrentUser(user);
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid username or password!');
        }
    });
}

// Dashboard and session management
if (document.getElementById('logoutBtn')) {
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    
    // Display current user
    const currentUser = db.getCurrentUser();
    if (currentUser && userInfo) {
        userInfo.textContent = `Welcome, ${currentUser.username}`;
    } else {
        // Redirect to login if no user is logged in
        window.location.href = 'index.html';
    }
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        db.clearCurrentUser();
        window.location.href = 'index.html';
    });
    
    // Session timeout (30 minutes)
    let inactivityTime = function() {
        let time;
        
        const resetTimer = () => {
            clearTimeout(time);
            time = setTimeout(logout, 30 * 60 * 1000);
        };
        
        const logout = () => {
            db.clearCurrentUser();
            alert('Session expired due to inactivity');
            window.location.href = 'index.html';
        };
        
        window.onload = resetTimer;
        window.onmousemove = resetTimer;
        window.onkeypress = resetTimer;
        window.onclick = resetTimer;
        window.onscroll = resetTimer;
    };
    
    inactivityTime();
}

// Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Back button functionality
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.history.back();
        });
    });
});