// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    if (auth.redirectUnauthorized()) return;
    updateAuthUI();

    const orders = getOrders();
    const users = getUsers();
    const menuItems = getMenuItems();

    updateGreeting();
    updateStats(orders, users, menuItems);
    renderRecentOrders(orders);
    renderCharts(orders);

    function updateGreeting() {
        const greetingEl = document.getElementById('userGreeting');
        if (greetingEl && auth.currentUser) {
            greetingEl.textContent = `Welcome, ${auth.currentUser.name}`;
        }
    }

    function getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function getMenuItems() {
        return JSON.parse(localStorage.getItem('menuItems')) || [];
    }

    function updateStats(allOrders, allUsers, allMenuItems) {
        const totalOrdersEl = document.getElementById('totalOrders');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalCustomersEl = document.getElementById('totalCustomers');
        const totalMenuItemsEl = document.getElementById('totalMenuItems');

        const totalOrders = allOrders.length;
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalCustomers = allUsers.filter(user => user.role === 'user').length;
        const totalMenuItems = allMenuItems.length;

        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders.toString();
        if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
        if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers.toString();
        if (totalMenuItemsEl) totalMenuItemsEl.textContent = totalMenuItems.toString();
    }

    function renderRecentOrders(allOrders) {
        const tableBody = document.getElementById('recentOrdersTable');
        if (!tableBody) return;

        if (!allOrders.length) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; color:#666;">No orders yet</td>
                </tr>
            `;
            return;
        }

        const sorted = [...allOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sorted.slice(0, 6);

        tableBody.innerHTML = recent.map(order => {
            const statusClass = mapStatusToBadge(order.status);
            const itemsCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customerName || 'Customer'}</td>
                    <td>${itemsCount}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${formatStatus(order.status)}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-secondary btn-sm view-order" data-id="${order.id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tableBody.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.dataset.id, 10);
                const order = allOrders.find(o => o.id === orderId);
                if (!order) return;
                const itemList = (order.items || []).map(item => `${item.name} x${item.quantity}`).join(', ');
                showAlert(`Order #${order.id}: ${itemList || 'No items listed'}`, 'success');
            });
        });
    }

    function renderCharts(allOrders) {
        if (typeof Chart === 'undefined') return;

        const revenueCtx = document.getElementById('revenueChart');
        const popularCtx = document.getElementById('popularItemsChart');

        const revenueData = buildRevenueData(allOrders);
        if (revenueCtx) {
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: revenueData.labels,
                    datasets: [{
                        label: 'Revenue',
                        data: revenueData.values,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        fill: true,
                        tension: 0.35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: (value) => `$${value}`
                            }
                        }
                    }
                }
            });
        }

        const popularData = buildPopularItemsData(allOrders);
        if (popularCtx) {
            new Chart(popularCtx, {
                type: 'bar',
                data: {
                    labels: popularData.labels,
                    datasets: [{
                        label: 'Orders',
                        data: popularData.values,
                        backgroundColor: ['#667eea', '#5a67d8', '#7c3aed', '#6366f1', '#818cf8'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }
    }

    function buildRevenueData(allOrders) {
        const months = getLastSixMonths();
        const values = months.map(month => {
            const monthOrders = allOrders.filter(order => {
                if (!order.date) return false;
                const date = new Date(order.date);
                return date.getFullYear() === month.year && date.getMonth() === month.index;
            });
            return monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        });

        return {
            labels: months.map(m => m.label),
            values
        };
    }

    function buildPopularItemsData(allOrders) {
        const counts = {};
        allOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const name = item.name || 'Item';
                counts[name] = (counts[name] || 0) + (item.quantity || 1);
            });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const labels = sorted.length ? sorted.map(item => item[0]) : ['No data'];
        const values = sorted.length ? sorted.map(item => item[1]) : [0];

        return { labels, values };
    }

    function getLastSixMonths() {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                index: date.getMonth(),
                year: date.getFullYear(),
                label: date.toLocaleString('en-US', { month: 'short' })
            });
        }
        return months;
    }

    function mapStatusToBadge(status) {
        if (status === 'delivered') return 'status-completed';
        if (status === 'processing') return 'status-processing';
        return 'status-pending';
    }

    function formatStatus(status = '') {
        const safe = status || 'pending';
        return safe.charAt(0).toUpperCase() + safe.slice(1);
    }
});
