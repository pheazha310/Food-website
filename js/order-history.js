// js/order-history.js
document.addEventListener('DOMContentLoaded', () => {
            if (auth.redirectUnauthorized()) return;
            updateAuthUI();
            updateCartCount();

            // DOM Elements
            const ordersContainer = document.getElementById('ordersContainer');
            const emptyOrdersMessage = document.getElementById('emptyOrdersMessage');
            const filterBtns = document.querySelectorAll('.filter-btn');
            const startDate = document.getElementById('startDate');
            const endDate = document.getElementById('endDate');
            const applyDateFilter = document.getElementById('applyDateFilter');
            const orderDetailsModal = document.getElementById('orderDetailsModal');
            const orderDetailsContent = document.getElementById('orderDetailsContent');
            const closeModalBtns = document.querySelectorAll('.close-modal');

            // Set default dates (last 30 days)
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setDate(today.getDate() - 30);

            if (startDate) startDate.value = lastMonth.toISOString().split('T')[0];
            if (endDate) endDate.value = today.toISOString().split('T')[0];

            // Event Listeners
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    loadOrders();
                });
            });

            if (applyDateFilter) applyDateFilter.addEventListener('click', loadOrders);

            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal());
            });

            // Close modal on outside click
            if (orderDetailsModal) orderDetailsModal.addEventListener('click', (e) => {
                if (e.target === orderDetailsModal) {
                    closeModal();
                }
            });

            // Load initial orders
            loadOrders();

            // Load orders
            function loadOrders() {
                const activeFilter = document.querySelector('.filter-btn.active');
                const status = activeFilter ? activeFilter.dataset.status : 'all';
                const start = startDate ? (startDate.value ? new Date(startDate.value) : null) : null;
                const end = endDate ? (endDate.value ? new Date(endDate.value) : null) : null;

                let orders = getOrders();

                // Filter by user (only show current user's orders)
                if (auth.isUser()) {
                    orders = orders.filter(order => order.customerId === auth.currentUser.id);
                }

                // Filter by status
                if (status !== 'all') {
                    orders = orders.filter(order => order.status === status);
                }

                // Filter by date
                if (start && end) {
                    orders = orders.filter(order => {
                        const orderDate = new Date(order.date);
                        return orderDate >= start && orderDate <= end;
                    });
                }

                displayOrders(orders);
                updateOrderStats(orders);
            }

            // Get orders from localStorage
            function getOrders() {
                return JSON.parse(localStorage.getItem('orders')) || [];
            }

            // Display orders
            function displayOrders(orders) {
                if (orders.length === 0) {
                    emptyOrdersMessage.style.display = 'block';
                    ordersContainer.innerHTML = '';
                    return;
                }

                emptyOrdersMessage.style.display = 'none';

                // Sort by date (newest first)
                orders.sort((a, b) => new Date(b.date) - new Date(a.date));

                ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card ${order.status}" data-id="${order.id}" onclick="viewOrderDetails(${order.id})">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order #${order.id}</h3>
                        <div class="order-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(order.date)}</span>
                            <span><i class="fas fa-clock"></i> ${formatTime(order.date)}</span>
                            ${auth.isAdmin() ? `<span><i class="fas fa-user"></i> ${order.customerName || 'Customer'}</span>` : ''}
                        </div>
                    </div>
                    <span class="order-status status-${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
                
                <div class="order-items-preview">
                    <h4>Items (${order.items.length})</h4>
                    <div class="items-list">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="item-preview">
                                <img src="${item.image}" alt="${item.name}">
                                <div class="item-info">
                                    <h5>${item.name}</h5>
                                    <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `<div class="item-preview">+${order.items.length - 3} more items</div>` : ''}
                    </div>
                </div>
                
                <div class="order-footer">
                    <div class="order-total">Total: $${order.total.toFixed(2)}</div>
                    <div class="order-actions">
                        ${order.status === 'pending' ? `
                            <button class="btn btn-danger btn-order-action" onclick="cancelOrder(${order.id}, event)">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        ` : ''}
                        <button class="btn btn-primary btn-order-action" onclick="viewOrderDetails(${order.id}, event)">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function updateOrderStats(orders) {
        const totalOrdersEl = document.getElementById('totalOrdersCount');
        const lastOrderEl = document.getElementById('lastOrderDate');
        const topItemEl = document.getElementById('topItemName');

        if (totalOrdersEl) totalOrdersEl.textContent = orders.length;

        if (lastOrderEl) {
            if (!orders.length) {
                lastOrderEl.textContent = '--';
            } else {
                const lastOrder = orders.reduce((latest, order) => {
                    const latestDate = new Date(latest.date || 0);
                    const orderDate = new Date(order.date || 0);
                    return orderDate > latestDate ? order : latest;
                }, orders[0]);
                lastOrderEl.textContent = lastOrder.date ? formatDate(lastOrder.date) : '--';
            }
        }

        if (topItemEl) {
            const counts = {};
            orders.forEach(order => {
                (order.items || []).forEach(item => {
                    const name = item.name || 'Item';
                    counts[name] = (counts[name] || 0) + (item.quantity || 1);
                });
            });
            const topItem = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            topItemEl.textContent = topItem ? topItem[0] : '--';
        }
    }

    // View order details
    window.viewOrderDetails = function(orderId, event = null) {
        if (event) event.stopPropagation();
        
        const orders = getOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) return;
        
        orderDetailsContent.innerHTML = `
            <div class="detail-section">
                <h4>Order Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span class="detail-value">#${order.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Date:</span>
                    <span class="detail-value">${formatDateTime(order.date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
                ${auth.isAdmin() ? `
                    <div class="detail-row">
                        <span class="detail-label">Customer:</span>
                        <span class="detail-value">${order.customerName || 'N/A'}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="detail-section">
                <h4>Delivery Information</h4>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span class="detail-value">${order.deliveryAddress || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${order.phoneNumber || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Delivery Time:</span>
                    <span class="detail-value">${getDeliveryTimeText(order.deliveryTime)}</span>
                </div>
                ${order.specialInstructions ? `
                    <div class="detail-row">
                        <span class="detail-label">Special Instructions:</span>
                        <span class="detail-value">${order.specialInstructions}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1) : 'N/A'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Order Items</h4>
                <table class="order-items-details">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="${item.image}" alt="${item.name}" class="item-image">
                                        <div>
                                            <strong>${item.name}</strong>
                                            <p style="color: #666; margin: 0;">${item.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>${item.quantity}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="detail-section">
                <h4>Order Summary</h4>
                <div class="detail-total">
                    <div class="detail-row">
                        <span class="detail-label">Subtotal:</span>
                        <span class="detail-value">$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Delivery Fee:</span>
                        <span class="detail-value">$${order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tax (8.5%):</span>
                        <span class="detail-value">$${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total:</span>
                        <span class="detail-value">$${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        orderDetailsModal.classList.add('active');
    };
    
    // Cancel order
    window.cancelOrder = function(orderId, event = null) {
        if (event) event.stopPropagation();
        
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        let orders = getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        
        if (index !== -1) {
            orders[index].status = 'cancelled';
            localStorage.setItem('orders', JSON.stringify(orders));
            showAlert('Order cancelled successfully!', 'success');
            loadOrders();
        }
    };
    
    // Close modal
    function closeModal() {
        orderDetailsModal.classList.remove('active');
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Format time
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Format date and time
    function formatDateTime(dateString) {
        return `${formatDate(dateString)} at ${formatTime(dateString)}`;
    }
    
    // Get delivery time text
    function getDeliveryTimeText(timeCode) {
        const times = {
            'asap': 'ASAP (30-45 minutes)',
            '1hour': 'Within 1 hour',
            '2hours': 'Within 2 hours',
            'specific': 'Specific time'
        };
        return times[timeCode] || 'N/A';
    }
    
    // Logout handled globally in auth.js
});

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
