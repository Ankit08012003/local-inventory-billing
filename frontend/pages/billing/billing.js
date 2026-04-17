let products = [];
let customers = [];
let cart = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.body.insertBefore(createSidebar(), document.body.firstChild);
    document.getElementById('nav-billing').classList.add('active');
    
    await Promise.all([fetchProducts(), fetchCustomers()]);
    
    document.getElementById('paidAmount').addEventListener('input', updateTotals);
});

const fetchProducts = async () => {
    products = await apiFetch('/products');
    renderProducts(products);
};

const fetchCustomers = async () => {
    customers = await apiFetch('/customers');
    const select = document.getElementById('customerSelect');
    customers.forEach(c => {
        const option = document.createElement('option');
        option.value = c._id;
        option.textContent = `${c.name} (${c.mobile})`;
        select.appendChild(option);
    });
};

const renderProducts = (prods) => {
    const list = document.getElementById('productList');
    list.innerHTML = '';
    
    prods.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div>
                <strong>${p.name}</strong><br>
                <small style="color: var(--text-muted);">₹${p.price} | Stock: ${p.quantity}</small>
            </div>
            <button class="btn" style="width: auto; padding: 0.25rem 0.75rem;" onclick="addToCart('${p._id}')" ${p.quantity === 0 ? 'disabled' : ''}>Add</button>
        `;
        list.appendChild(div);
    });
};

const filterProducts = () => {
    const term = document.getElementById('productSearch').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    renderProducts(filtered);
};

const addToCart = (id) => {
    const product = products.find(p => p._id === id);
    if (!product) return;
    
    const existing = cart.find(item => item.productId === id);
    if (existing) {
        if (existing.quantity < product.quantity) {
            existing.quantity++;
        } else {
            showToast('Not enough stock', 'error');
        }
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            maxStock: product.quantity
        });
    }
    
    renderCart();
};

const updateCartQty = (id, qty) => {
    const item = cart.find(i => i.productId === id);
    if (!item) return;
    
    qty = parseInt(qty);
    if (qty > item.maxStock) {
        showToast('Not enough stock', 'error');
        item.quantity = item.maxStock;
    } else if (qty <= 0) {
        cart = cart.filter(i => i.productId !== id);
    } else {
        item.quantity = qty;
    }
    renderCart();
};

const renderCart = () => {
    const container = document.getElementById('selectedItems');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-muted);" id="emptyCart">Cart is empty</p>';
        document.getElementById('generateBillBtn').disabled = true;
    } else {
        document.getElementById('generateBillBtn').disabled = false;
        container.innerHTML = cart.map(item => `
            <div class="product-item" style="border: none; padding: 0.25rem 0;">
                <div style="flex: 1;">${item.name}</div>
                <input type="number" value="${item.quantity}" onchange="updateCartQty('${item.productId}', this.value)" style="margin: 0 1rem;">
                <div style="width: 80px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
    }
    updateTotals();
};

const updateTotals = () => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;

    const dueAmount = totalAmount - paidAmount;

    document.getElementById('totalAmountText').textContent = `₹${totalAmount.toFixed(2)}`;
    document.getElementById('dueAmountText').textContent = `₹${dueAmount.toFixed(2)}`;
    
    const customerId = document.getElementById('customerSelect').value;
    if (dueAmount > 0 && !customerId) {
        document.getElementById('dueAmountText').innerHTML += ' <br><small>(Requires Customer Selection)</small>';
        document.getElementById('generateBillBtn').disabled = true;
    } else if (cart.length > 0) {
        document.getElementById('generateBillBtn').disabled = false;
    }
};

const generateBill = async () => {
    const customerId = document.getElementById('customerSelect').value;
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const dueAmount = totalAmount - paidAmount;

    if (dueAmount > 0 && !customerId) {
        showToast('Please select a customer for due balance', 'error');
        return;
    }

    const billData = {
        items: cart.map(i => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
        customerId: customerId || null,
        totalAmount,
        paidAmount,
        dueAmount
    };

    const btn = document.getElementById('generateBillBtn');
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
        await apiFetch('/bills', {
            method: 'POST',
            body: JSON.stringify(billData)
        });
        
        showToast('Bill generated successfully!');
        cart = [];
        document.getElementById('paidAmount').value = '';
        document.getElementById('customerSelect').value = '';
        renderCart();
        await fetchProducts(); // Refresh stock
    } catch (error) {
        // handled in utils
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Bill';
    }
};
