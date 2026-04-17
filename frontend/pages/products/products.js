let products = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.body.insertBefore(createSidebar(), document.body.firstChild);
    document.getElementById('nav-products').classList.add('active');
    await fetchProducts();
});

const fetchProducts = async () => {
    const data = await apiFetch('/products');
    if (data) {
        products = data;
        renderProducts();
    }
};

const renderProducts = () => {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No products found. Add some!</td></tr>`;
        return;
    }

    products.forEach(p => {
        const tr = document.createElement('tr');
        const status = p.quantity < 5 ? `<span style="color: var(--danger); font-weight: 600;">Low Stock</span>` : `<span style="color: var(--secondary);">In Stock</span>`;
        
        tr.innerHTML = `
            <td>${p.name}</td>
            <td>₹${p.price}</td>
            <td>${p.quantity}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; width: auto; font-size: 0.8rem;" onclick="editProduct('${p._id}')">Edit</button>
                <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; width: auto; font-size: 0.8rem; margin-left: 0.5rem;" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

const openModal = () => {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
};

const closeModal = () => {
    document.getElementById('productModal').classList.remove('active');
};

const editProduct = (id) => {
    const p = products.find(prod => prod._id === id);
    if (!p) return;
    
    document.getElementById('productId').value = p._id;
    document.getElementById('name').value = p.name;
    document.getElementById('price').value = p.price;
    document.getElementById('quantity').value = p.quantity;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productModal').classList.add('active');
};

const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        showToast('Product deleted successfully');
        await fetchProducts();
    } catch (error) {
        // error handled in utils
    }
};

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('name').value,
        price: Number(document.getElementById('price').value),
        quantity: Number(document.getElementById('quantity').value)
    };

    try {
        if (id) {
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
            showToast('Product updated successfully');
        } else {
            await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
            showToast('Product added successfully');
        }
        closeModal();
        await fetchProducts();
    } catch (error) {
        // error handled
    }
});
