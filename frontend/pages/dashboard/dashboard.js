document.addEventListener('DOMContentLoaded', async () => {
    // Inject sidebar
    document.body.insertBefore(createSidebar(), document.body.firstChild);
    document.getElementById('nav-dashboard').classList.add('active');

    try {
        const [products, customers, bills] = await Promise.all([
            apiFetch('/products'),
            apiFetch('/customers'),
            apiFetch('/bills')
        ]);

        // Calculate Stats
        document.getElementById('totalProducts').textContent = products.length;
        
        const lowStock = products.filter(p => p.quantity < 5).length;
        document.getElementById('lowStockItems').textContent = lowStock;

        document.getElementById('totalCustomers').textContent = customers.length;

        const totalDue = customers.reduce((acc, c) => acc + (c.totalDue > 0 ? c.totalDue : 0), 0);
        document.getElementById('totalReceivables').textContent = `₹${totalDue}`;

        // Recent Bills (last 5)
        const tbody = document.querySelector('#recentBillsTable tbody');
        const recentBills = bills.slice(0, 5);
        
        if (recentBills.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">No recent bills found</td></tr>`;
        } else {
            recentBills.forEach(bill => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(bill.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                    <td>₹${bill.totalAmount}</td>
                    <td style="color: var(--secondary);">₹${bill.paidAmount}</td>
                    <td style="color: ${bill.dueAmount > 0 ? 'var(--danger)' : 'var(--text-muted)'};">₹${bill.dueAmount}</td>
                `;
                tbody.appendChild(tr);
            });
        }

    } catch (error) {
        console.error('Error loading dashboard data', error);
    }
});
