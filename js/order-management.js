// js/order-management.js
document.addEventListener('DOMContentLoaded', () => {
    if (auth.redirectUnauthorized()) return;
    updateAuthUI();

    const ordersTableBody = document.getElementById('ordersTableBody');
    const ordersEmpty = document.getElementById('ordersEmpty');
    const ordersCount = document.getElementById('ordersCount');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const orderModal = document.getElementById('orderModal');
    const orderModalBody = document.getElementById('orderModalBody');
    const closeModalBtn = document.querySelector('.close-modal');

    statusFilter?.addEventListener('change', renderOrders);
    searchInput?.addEventListener('input', renderOrders);
    closeModalBtn?.addEventListener('click', closeModal);

    orderModal?.addEventListener('click', (e) => {
        if (e.target === orderModal) closeModal();
    });

    renderOrders();

    function getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    function saveOrders(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    function renderOrders() {
        const status = statusFilter ? statusFilter.value : 'all';
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const orders = getOrders();

        let filtered = orders;
        if (status !== 'all') {
            filtered = filtered.filter(order => order.status === status);
        }
        if (query) {
            filtered = filtered.filter(order => {
                const idMatch = String(order.id || '').includes(query);
                const nameMatch = (order.customerName || '').toLowerCase().includes(query);
                return idMatch || nameMatch;
            });
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (ordersCount) ordersCount.textContent = filtered.length.toString();

        if (!ordersTableBody) return;
        if (filtered.length === 0) {
            ordersTableBody.innerHTML = '';
            if (ordersEmpty) ordersEmpty.style.display = 'block';
            return;
        }

        if (ordersEmpty) ordersEmpty.style.display = 'none';

        ordersTableBody.innerHTML = filtered.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customerName || 'Customer'}</td>
                <td>${formatDate(order.date)}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td><span class="status-badge ${mapStatusToBadge(order.status)}">${formatStatus(order.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm view-order" data-id="${order.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-outline btn-sm mark-processing" data-id="${order.id}">
                            <i class="fas fa-sync"></i> Processing
                        </button>
                        <button class="btn btn-success btn-sm mark-delivered" data-id="${order.id}">
                            <i class="fas fa-check"></i> Delivered
                        </button>
                        <button class="btn btn-danger btn-sm mark-cancelled" data-id="${order.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        ordersTableBody.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id, 10)));
        });
        ordersTableBody.querySelectorAll('.mark-processing').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(parseInt(btn.dataset.id, 10), 'processing'));
        });
        ordersTableBody.querySelectorAll('.mark-delivered').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(parseInt(btn.dataset.id, 10), 'delivered'));
        });
        ordersTableBody.querySelectorAll('.mark-cancelled').forEach(btn => {
            btn.addEventListener('click', () => updateStatus(parseInt(btn.dataset.id, 10), 'cancelled'));
        });
    }

    function updateStatus(orderId, status) {
        const orders = getOrders();
        const index = orders.findIndex(order => order.id === orderId);
        if (index === -1) return;
        orders[index].status = status;
        saveOrders(orders);
        renderOrders();
        showAlert(`Order #${orderId} marked as ${formatStatus(status)}`, 'success');
    }

    function openModal(orderId) {
        const orders = getOrders();
        const order = orders.find(item => item.id === orderId);
        if (!order || !orderModalBody) return;

        const itemsList = (order.items || []).map(item => `
            <div class="detail-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        orderModalBody.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">#${order.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer</span>
                <span class="detail-value">${order.customerName || 'Customer'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${formatDate(order.date)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">${formatStatus(order.status)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Delivery</span>
                <span class="detail-value">${order.deliveryAddress || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${order.phoneNumber || 'N/A'}</span>
            </div>
            <div class="detail-items">
                ${itemsList || '<span>No items found</span>'}
            </div>
            <div class="detail-row">
                <span class="detail-label">Total</span>
                <span class="detail-value">$${(order.total || 0).toFixed(2)}</span>
            </div>
        `;

        orderModal.classList.add('active');
    }

    function closeModal() {
        orderModal?.classList.remove('active');
    }

    function formatDate(dateString) {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function mapStatusToBadge(status) {
        if (status === 'processing') return 'status-processing';
        if (status === 'delivered') return 'status-delivered';
        if (status === 'cancelled') return 'status-cancelled';
        return 'status-pending';
    }

    function formatStatus(status = '') {
        const safe = status || 'pending';
        return safe.charAt(0).toUpperCase() + safe.slice(1);
    }
});
