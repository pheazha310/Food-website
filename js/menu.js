// js/menu.js
document.addEventListener('DOMContentLoaded', () => {
            updateAuthUI();
            updateCartCount();

            const menuManager = new MenuManager();
            const cartManager = new CartManager();

            // DOM Elements
            const menuContainer = document.getElementById('menuContainer');
            const categoryBtns = document.querySelectorAll('.category-btn');
            const menuSearch = document.getElementById('menuSearch');
            const addMenuItemBtn = document.getElementById('addMenuItemBtn');
            const menuItemModal = document.getElementById('menuItemModal');
            const menuItemForm = document.getElementById('menuItemForm');
            const closeModalBtns = document.querySelectorAll('.close-modal');
            const adminControls = document.getElementById('adminControls');

            let editingMenuItemId = null;

            // Show admin controls if admin
            if (auth.isAdmin()) {
                if (adminControls) adminControls.classList.remove('hidden');
            }

            // Event Listeners
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    loadMenuItems(btn.dataset.category);
                });
            });

            if (menuSearch) menuSearch.addEventListener('input', () => {
                const activeBtn = document.querySelector('.category-btn.active');
                loadMenuItems(activeBtn ? activeBtn.dataset.category : 'all');
            });

            if (addMenuItemBtn) addMenuItemBtn.addEventListener('click', () => openMenuItemModal());

            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal());
            });


            if (menuItemForm) menuItemForm.addEventListener('submit', handleMenuItemSubmit);

            // Close modal on outside click
            if (menuItemModal) menuItemModal.addEventListener('click', (e) => {
                if (e.target === menuItemModal) {
                    closeModal();
                }
            });

            // Load initial menu items
            loadMenuItems('all');

            // Menu Manager Class
            function MenuManager() {
                this.getMenuItems = () => {
                    return JSON.parse(localStorage.getItem('menuItems')) || [];
                };

                this.saveMenuItems = (items) => {
                    localStorage.setItem('menuItems', JSON.stringify(items));
                };

                this.createMenuItem = (item) => {
                    const items = this.getMenuItems();
                    const newItem = {
                        id: Date.now(),
                        ...item,
                        image: item.image || 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
                    };
                    items.push(newItem);
                    this.saveMenuItems(items);
                    return newItem;
                };

                this.updateMenuItem = (id, updates) => {
                    const items = this.getMenuItems();
                    const index = items.findIndex(m => m.id === id);
                    if (index !== -1) {
                        items[index] = {...items[index], ...updates };
                        this.saveMenuItems(items);
                        return true;
                    }
                    return false;
                };

                this.deleteMenuItem = (id) => {
                    const items = this.getMenuItems();
                    const filtered = items.filter(m => m.id !== id);
                    this.saveMenuItems(filtered);
                };

                this.getMenuItemById = (id) => {
                    const items = this.getMenuItems();
                    return items.find(m => m.id === id);
                };
            }

            // Cart Manager Class
            function CartManager() {
                this.getCart = () => {
                    return JSON.parse(localStorage.getItem('cart')) || [];
                };

                this.addToCart = (item, quantity = 1) => {
                    let cart = this.getCart();
                    const existing = cart.find(c => c.id === item.id);

                    if (existing) {
                        existing.quantity += quantity;
                    } else {
                        cart.push({
                            ...item,
                            quantity: quantity
                        });
                    }

                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartCount();
                    return cart;
                };
            }

            // Load menu items with filtering
            function loadMenuItems(category) {
                const items = menuManager.getMenuItems();
                const search = menuSearch ? (menuSearch.value ? menuSearch.value.toLowerCase() : '') : '';

                let filtered = items;

                if (category !== 'all') {
                    filtered = filtered.filter(item => item.category === category);
                }

                if (search) {
                    filtered = filtered.filter(item =>
                        item.name.toLowerCase().includes(search) ||
                        item.description.toLowerCase().includes(search) ||
                        item.category.toLowerCase().includes(search)
                    );
                }

                displayMenuItems(filtered);
            }

            // Display menu items
            function displayMenuItems(items) {
                if (!menuContainer) return;

                menuContainer.innerHTML = items.map(item => `
            <div class="menu-item-card">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <div class="menu-item-title">
                            <h3>${item.name}</h3>
                            <div class="menu-item-category">
                                ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </div>
                        </div>
                        <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    
                    <div class="menu-item-description">
                        <p>${item.description}</p>
                    </div>
                    
                    <div class="menu-item-details">
                        <div>
                            ${item.calories ? `<span><i class="fas fa-fire"></i> ${item.calories} cal</span>` : ''}
                            ${item.prepTime ? `<span><i class="fas fa-clock"></i> ${item.prepTime} min</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="menu-item-actions">
                        <button class="btn-add-cart add-to-cart" data-id="${item.id}">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        
                        ${auth.isAdmin() ? `
                            <button class="btn btn-secondary btn-sm edit-menu-item" data-id="${item.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-menu-item" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!auth.isLoggedIn() || !auth.isUser()) {
                    alert('Please login as a customer to add items to cart');
                    window.location.href = 'login.html';
                    return;
                }
                
                const id = parseInt(e.target.closest('.add-to-cart').dataset.id);
                const item = menuManager.getMenuItemById(id);
                if (item) {
                    cartManager.addToCart(item);
                    showAlert(`${item.name} added to cart!`, 'success');
                }
            });
        });
        
        if (auth.isAdmin()) {
            document.querySelectorAll('.edit-menu-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.edit-menu-item').dataset.id);
                    editMenuItem(id);
                });
            });
            
            document.querySelectorAll('.delete-menu-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.closest('.delete-menu-item').dataset.id);
                    deleteMenuItem(id);
                });
            });
        }
    }
    
    // Open menu item modal
    function openMenuItemModal(item = null) {
        const modalTitle = document.getElementById('menuModalTitle');
        
        if (item) {
            modalTitle.textContent = 'Edit Menu Item';
            document.getElementById('menuItemId').value = item.id;
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemDescription').value = item.description;
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemImage').value = item.image || '';
            document.getElementById('itemCalories').value = item.calories || '';
            document.getElementById('itemPrepTime').value = item.prepTime || '15';
            editingMenuItemId = item.id;
        } else {
            modalTitle.textContent = 'Add Menu Item';
            menuItemForm.reset();
            document.getElementById('menuItemId').value = '';
            editingMenuItemId = null;
        }
        
        menuItemModal.classList.add('active');
    }
    
    // Close modal
    function closeModal() {
        menuItemModal.classList.remove('active');
        menuItemForm.reset();
        editingMenuItemId = null;
    }
    
    // Handle menu item submission
    function handleMenuItemSubmit(e) {
        e.preventDefault();
        
        const itemData = {
            name: document.getElementById('itemName').value,
            description: document.getElementById('itemDescription').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            category: document.getElementById('itemCategory').value,
            image: document.getElementById('itemImage').value || undefined,
            calories: document.getElementById('itemCalories').value ? parseInt(document.getElementById('itemCalories').value) : undefined,
            prepTime: document.getElementById('itemPrepTime').value ? parseInt(document.getElementById('itemPrepTime').value) : undefined
        };
        
        if (editingMenuItemId) {
            const success = menuManager.updateMenuItem(editingMenuItemId, itemData);
            if (success) {
                showAlert('Menu item updated successfully!', 'success');
            }
        } else {
            menuManager.createMenuItem(itemData);
            showAlert('Menu item created successfully!', 'success');
        }
        
        closeModal();
        loadMenuItems('all');
    }
    
    // Edit menu item
    function editMenuItem(id) {
        const item = menuManager.getMenuItemById(id);
        if (item) {
            openMenuItemModal(item);
        }
    }
    
    // Delete menu item
    function deleteMenuItem(id) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            menuManager.deleteMenuItem(id);
            showAlert('Menu item deleted successfully!', 'success');
            loadMenuItems('all');
        }
    }
});

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

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