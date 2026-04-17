const API_URL = '/api';

const showToast = (message, type = 'success') => {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
};

const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            const isAuthPage = window.location.pathname.includes('/auth/');
            if (!isAuthPage) {
                localStorage.removeItem('token');
                window.location.href = '/pages/auth/login.html';
                return null;
            }
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/pages/auth/login.html';
};

const createSidebar = () => {
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
        <h2>Inventory<br>System</h2>
        <div class="nav-links">
            <a href="/pages/dashboard/dashboard.html" id="nav-dashboard">Dashboard</a>
            <a href="/pages/products/products.html" id="nav-products">Products</a>
            <a href="/pages/customers/customers.html" id="nav-customers">Customers</a>
            <a href="/pages/billing/billing.html" id="nav-billing">Billing</a>
            <a href="/pages/payments/payments.html" id="nav-payments">Payments</a>
            <a href="#" onclick="logout()" style="margin-top: auto; color: var(--danger);">Logout</a>
        </div>
    `;
    return sidebar;
};
