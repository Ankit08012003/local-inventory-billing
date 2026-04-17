let customers = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.body.insertBefore(createSidebar(), document.body.firstChild);
    document.getElementById('nav-payments').classList.add('active');
    
    await fetchCustomers();
});

const fetchCustomers = async () => {
    customers = await apiFetch('/customers');
    const select = document.getElementById('customerId');
    customers.forEach(c => {
        const option = document.createElement('option');
        option.value = c._id;
        option.textContent = `${c.name} (${c.mobile})`;
        select.appendChild(option);
    });
};

const updateCustomerDue = () => {
    const id = document.getElementById('customerId').value;
    const textElement = document.getElementById('currentDueText');
    if (!id) {
        textElement.textContent = '';
        return;
    }
    
    const customer = customers.find(c => c._id === id);
    if (customer) {
        if (customer.totalDue > 0) {
            textElement.innerHTML = `Current Status: <span style="color: var(--danger)">Owes ₹${customer.totalDue.toFixed(2)}</span>`;
        } else if (customer.totalDue < 0) {
            textElement.innerHTML = `Current Status: <span style="color: var(--secondary)">Advance ₹${Math.abs(customer.totalDue).toFixed(2)}</span>`;
        } else {
            textElement.innerHTML = `Current Status: <span style="color: var(--text-muted)">Settled (₹0)</span>`;
        }
    }
};

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerId = document.getElementById('customerId').value;
    const amount = Number(document.getElementById('amount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const note = document.getElementById('note').value;
    
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Recording...';

    try {
        await apiFetch('/transactions', {
            method: 'POST',
            body: JSON.stringify({ customerId, amount, paymentMethod, note })
        });
        
        showToast('Payment recorded successfully!');
        document.getElementById('paymentForm').reset();
        document.getElementById('currentDueText').textContent = '';
        await fetchCustomers(); // Refresh data
    } catch (error) {
        // error handled in utils
    } finally {
        btn.disabled = false;
        btn.textContent = 'Record Payment';
    }
});
