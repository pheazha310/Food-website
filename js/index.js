// js/index.js
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedItems();
    updateAuthUI();
});

function loadFeaturedItems() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const featuredContainer = document.getElementById('featuredItems');

    if (!featuredContainer) return;

    // Get first 3 items as featured
    const featuredItems = menuItems.slice(0, 3);

    featuredContainer.innerHTML = featuredItems.map(item => `
        <div class="menu-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                <button class="btn btn-primary add-to-cart" data-id="${item.id}">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            if (!auth.isLoggedIn() || !auth.isUser()) {
                alert('Please login as a customer to add items to cart');
                window.location.href = 'pages/login.html';
                return;
            }

            const itemId = parseInt(e.target.closest('.add-to-cart').dataset.id);
            addToCart(itemId);
        });
    });
}

function addToCart(itemId) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const item = menuItems.find(m => m.id === itemId);

    if (!item) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(c => c.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    // Show success message
    showAlert('Item added to cart successfully!', 'success');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    document.body.insertBefore(alertDiv, document.body.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}