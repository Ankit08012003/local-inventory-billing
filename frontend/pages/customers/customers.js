let customers = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.body.insertBefore(createSidebar(), document.body.firstChild);
    document.getElementById('nav-customers').classList.add('active');
    await fetchCustomers();
});

const fetchCustomers = async () => {
    const data = await apiFetch('/customers');
    if (data) {
        customers = data;
        renderCustomers();
    }
};

const renderCustomers = () => {
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = '';
    
    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No customers found.</td></tr>`;
        return;
    }

    customers.forEach(c => {
        const tr = document.createElement('tr');
        let status = '<span style="color: var(--text-muted);">Settled</span>';
        if (c.totalDue > 0) status = `<span style="color: var(--danger);">Owes Money</span>`;
        if (c.totalDue < 0) status = `<span style="color: var(--secondary);">Advance Paid</span>`;

        tr.innerHTML = `
            <td>${c.name}</td>
            <td>${c.mobile}</td>
            <td style="font-weight: 600;">₹${Math.abs(c.totalDue)} ${c.totalDue < 0 ? '(Cr)' : ''}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; width: auto; font-size: 0.8rem;" onclick="viewLedger('${c._id}', '${c.name}')">Ledger</button>
                <button class="btn" style="background: var(--primary); padding: 0.25rem 0.5rem; width: auto; font-size: 0.8rem; margin-left: 0.5rem;" onclick="editCustomer('${c._id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; width: auto; font-size: 0.8rem; margin-left: 0.5rem;" onclick="deleteCustomer('${c._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

const openCustomerModal = () => {
    document.getElementById('customerModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
};

const closeCustomerModal = () => document.getElementById('customerModal').classList.remove('active');

const editCustomer = (id) => {
    const c = customers.find(cust => cust._id === id);
    if (!c) return;
    
    document.getElementById('customerId').value = c._id;
    document.getElementById('name').value = c.name;
    document.getElementById('mobile').value = c.mobile;
    document.getElementById('address').value = c.address;
    
    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('customerModal').classList.add('active');
};

const deleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
        await apiFetch(`/customers/${id}`, { method: 'DELETE' });
        showToast('Customer deleted successfully');
        await fetchCustomers();
    } catch (error) {
        // error handled in utils
    }
};

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('customerId').value;
    const customerData = {
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        address: document.getElementById('address').value
    };

    try {
        if (id) {
            await apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) });
            showToast('Customer updated successfully');
        } else {
            await apiFetch('/customers', { method: 'POST', body: JSON.stringify(customerData) });
            showToast('Customer added successfully');
        }
        closeCustomerModal();
        await fetchCustomers();
    } catch (error) {}
});

const viewLedger = async (id, name) => {
    document.getElementById('ledgerCustomerName').textContent = name;
    const tbody = document.querySelector('#ledgerTable tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    document.getElementById('ledgerModal').classList.add('active');

    try {
        const transactions = await apiFetch(`/transactions?customerId=${id}`);
        tbody.innerHTML = '';
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
            return;
        }

        transactions.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(t.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                <td><span style="color: ${t.type === 'CREDIT' ? 'var(--warning)' : 'var(--secondary)'}">${t.type}</span></td>
                <td>₹${t.amount}</td>
                <td>${t.paymentMethod}</td>
                <td>${t.note || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {}
};

const closeLedgerModal = () => document.getElementById('ledgerModal').classList.remove('active');
