// js/auth.js - Complete Authentication System
class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.initializeSampleData();
    }

    initializeSampleData() {
        // Sample users if none exist
        if (this.users.length === 0) {
            const sampleUsers = [{
                    id: 1,
                    username: 'admin',
                    email: 'admin@foodbusiness.com',
                    password: 'admin123',
                    role: 'admin',
                    name: 'Business Owner',
                    created: '2024-01-01'
                },
                {
                    id: 2,
                    username: 'customer',
                    email: 'customer@example.com',
                    password: 'customer123',
                    role: 'user',
                    name: 'John Doe',
                    created: '2024-01-01'
                }
            ];

            const sampleMenu = [{
                    id: 1,
                    name: 'Margherita Pizza',
                    description: 'Classic pizza with fresh mozzarella and basil',
                    price: 12.99,
                    category: 'Pizza',
                    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
                },
                {
                    id: 2,
                    name: 'Burger Deluxe',
                    description: 'Premium beef burger with cheese and veggies',
                    price: 10.99,
                    category: 'Burger',
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
                },
                {
                    id: 3,
                    name: 'Caesar Salad',
                    description: 'Fresh romaine with Caesar dressing and croutons',
                    price: 8.99,
                    category: 'Salad',
                    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
                }
            ];

            const sampleStrategies = [{
                    id: 1,
                    title: 'Social Media Marketing',
                    description: 'Increase social media presence by 50% in Q3',
                    status: 'active',
                    created: '2024-01-15'
                },
                {
                    id: 2,
                    title: 'Customer Loyalty Program',
                    description: 'Launch loyalty program to retain customers',
                    status: 'planning',
                    created: '2024-01-10'
                }
            ];

            localStorage.setItem('users', JSON.stringify(sampleUsers));
            localStorage.setItem('menuItems', JSON.stringify(sampleMenu));
            localStorage.setItem('strategies', JSON.stringify(sampleStrategies));
            localStorage.setItem('orders', JSON.stringify([]));
            localStorage.setItem('cart', JSON.stringify([]));
            localStorage.setItem('userAddresses', JSON.stringify([]));
            localStorage.setItem('userPreferences', JSON.stringify({}));
            localStorage.setItem('userNotifications', JSON.stringify({}));
            localStorage.setItem('contactMessages', JSON.stringify([]));

            this.users = sampleUsers;
        }
    }

    login(email, password) {
        const user = this.users.find(u =>
            (u.email === email || u.username === email) && u.password === password
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }

        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        const userName = this.currentUser ? this.currentUser.name : 'User';
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Clear cart on logout for security (for users only)
        if (this.isUser()) {
            localStorage.removeItem('cart');
        }

        return userName;
    }

    register(userData) {
        const userExists = this.users.some(u => u.email === userData.email || u.username === userData.username);

        if (userExists) {
            return { success: false, message: 'User already exists with this email or username' };
        }

        const newUser = {
            id: this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
            ...userData,
            role: 'user',
            created: new Date().toISOString().split('T')[0]
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        return { success: true, user: newUser };
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.isLoggedIn() && this.currentUser.role === 'admin';
    }

    isUser() {
        return this.isLoggedIn() && this.currentUser.role === 'user';
    }

    checkAccess(requiredRole) {
        if (!this.isLoggedIn()) {
            return false;
        }

        if (requiredRole === 'admin') {
            return this.isAdmin();
        }

        if (requiredRole === 'user') {
            return this.isUser();
        }

        return true;
    }

    redirectUnauthorized() {
        const path = window.location.pathname;
        const page = path.split('/').pop();

        // Pages that require authentication
        const protectedPages = {
            'dashboard.html': 'admin',
            'strategy.html': 'admin',
            'cart.html': 'user',
            'order-history.html': 'user',
            'profile.html': 'user'
        };

        if (protectedPages[page]) {
            if (!this.checkAccess(protectedPages[page])) {
                window.location.href = 'login.html';
                return true;
            }
        }

        return false;
    }

    updateProfile(updatedData) {
        if (!this.currentUser) return false;

        const index = this.users.findIndex(u => u.id === this.currentUser.id);
        if (index !== -1) {
            this.users[index] = {...this.users[index], ...updatedData };
            this.currentUser = this.users[index];
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    }

    // New method to check if user is on logout page
    isOnLogoutPage() {
        return window.location.pathname.includes('logout.html');
    }

    // New method to handle logout page redirect
    handleLogoutPageAccess() {
        if (this.isOnLogoutPage()) {
            // If user is not logged in and no logout intent, redirect to home
            const justLoggedOut = sessionStorage.getItem('justLoggedOut') === '1';
            if (!this.isLoggedIn() && !justLoggedOut) {
                window.location.href = '../index.html';
                return true;
            }
        }
        return false;
    }
}

// Create global auth instance
const auth = new Auth();

// Handle logout function
function handleLogout() {
    // If already on logout page, just refresh
    if (auth.isOnLogoutPage()) {
        window.location.reload();
        return;
    }

    // Mark intent so logout page can render after logout
    sessionStorage.setItem('justLoggedOut', '1');

    // Redirect to logout page (respect /pages path)
    const inPagesDir = window.location.pathname.includes('/pages/');
    window.location.href = inPagesDir ? 'logout.html' : 'pages/logout.html';
}

// Function to show alerts
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.padding = '15px 20px';
    alertDiv.style.borderRadius = '8px';
    alertDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 3000);
}

// Replace existing updateAuthUI() with improved version
function updateAuthUI() {
    // Helper: detect if current page is inside /pages/ directory
    const inPagesDir = window.location.pathname.includes('/pages/');
    const makeHref = (target) => (inPagesDir ? target : `pages/${target}`);

    const loginBtn = document.querySelector('a[href$="login.html"]');
    const registerBtn = document.querySelector('a[href$="register.html"]');
    // Allow logout link anywhere (id fallback)
    let logoutBtn = document.querySelector('a[href$="logout.html"]') || document.getElementById('logoutBtn');
    const userGreeting = document.getElementById('userGreeting');
    const cartCount = document.getElementById('cartCount');
    const navLinks = document.querySelector('.nav-links');

    // Small helpers to safely add/remove nav items without clobbering existing markup
    const ensureNavLink = (hrefTarget, liHtml, prepend = false) => {
        if (!navLinks) return;
        // find any anchor whose href ends with the target
        if (navLinks.querySelector(`a[href$="${hrefTarget}"]`)) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<li>${liHtml}</li>`;
        const li = wrapper.firstElementChild;
        if (prepend && navLinks.firstElementChild) navLinks.insertBefore(li, navLinks.firstElementChild);
        else navLinks.appendChild(li);
    };

    const removeNavLink = (hrefTarget) => {
        if (!navLinks) return;
        const a = navLinks.querySelector(`a[href$="${hrefTarget}"]`);
        if (a) {
            const li = a.closest('li');
            if (li) li.remove();
        }
    };

    const moveLogoutToEnd = () => {
        if (!navLinks) return;
        const logoutAnchor = navLinks.querySelector('a[href$="logout.html"], #logoutBtn');
        if (!logoutAnchor) return;
        const li = logoutAnchor.closest('li');
        if (!li || li.parentElement !== navLinks) return;
        navLinks.appendChild(li);
    };

    // Create a simple hamburger toggle if nav exists and toggle not present
    const initNavToggle = () => {
        if (!navLinks) return;
        if (document.getElementById('navToggle')) return;
        const btn = document.createElement('button');
        btn.id = 'navToggle';
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Toggle navigation');
        btn.className = 'nav-toggle';
        btn.innerHTML = '&#9776;'; // minimal hamburger
        btn.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        // Insert before navLinks for visibility
        if (navLinks.parentElement) navLinks.parentElement.insertBefore(btn, navLinks);
    };

    // Don't update UI on logout page
    if (auth.isOnLogoutPage()) return;

    // Initialize toggle (idempotent)
    initNavToggle();

    if (auth.isLoggedIn()) {
        if (navLinks) navLinks.classList.add('nav-auth');
        // Update login link to act as logout
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            loginBtn.href = makeHref('logout.html');
            loginBtn.onclick = null;
        }

        // Hide register
        if (registerBtn) registerBtn.style.display = 'none';

        // Ensure there's a logout button/link visible for admin pages
        if (logoutBtn) {
            logoutBtn.style.display = 'block';
            // If it's an <a>, set href; if it's a button keep it as-is
            if (logoutBtn.tagName.toLowerCase() === 'a') {
                logoutBtn.href = makeHref('logout.html');
                logoutBtn.onclick = null;
            }
            // Ensure logout always clears session
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            }, { once: true });
        }

        if (userGreeting && auth.currentUser) {
            userGreeting.textContent = `Welcome, ${auth.currentUser.name}`;
        }

        // Cart count for users
        if (cartCount && auth.isUser()) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }

        // Admin link
        if (auth.isAdmin()) {
            ensureNavLink('dashboard.html', `<a href="${makeHref('dashboard.html')}"><i class="fas fa-chart-line"></i> Dashboard</a>`, true);
            ensureNavLink('strategy.html', `<a href="${makeHref('strategy.html')}"><i class="fas fa-bullseye"></i> Strategies</a>`);
        }

        // User links (ensure all are added)
        if (auth.isUser()) {
            ensureNavLink('cart.html', `<a href="${makeHref('cart.html')}"><i class="fas fa-shopping-cart"></i> Cart <span id="cartCountInline" class="badge">${cartCount ? cartCount.textContent : ''}</span></a>`);
            ensureNavLink('order-history.html', `<a href="${makeHref('order-history.html')}"><i class="fas fa-history"></i> Orders</a>`);
            ensureNavLink('profile.html', `<a href="${makeHref('profile.html')}"><i class="fas fa-user"></i> Profile</a>`);
        }

        moveLogoutToEnd();
    } else {
        if (navLinks) navLinks.classList.remove('nav-auth');
        // Not logged in: set login link correctly
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
            loginBtn.href = makeHref('login.html');
            loginBtn.onclick = null;
        }

        // Show register
        if (registerBtn) registerBtn.style.display = 'block';

        // Hide logout button if present
        if (logoutBtn) logoutBtn.style.display = 'none';

        // Remove user-specific links safely
        ['cart.html', 'order-history.html', 'profile.html', 'dashboard.html', 'strategy.html'].forEach(removeNavLink);

        // Hide cart count
        if (cartCount) cartCount.style.display = 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Handle logout page access first
    if (auth.handleLogoutPageAccess()) {
        return;
    }

    // If on logout page, perform logout UI logic
    if (auth.isOnLogoutPage()) {
        const userName = auth.isLoggedIn() ? auth.logout() : 'User';
        sessionStorage.removeItem('justLoggedOut');

        const nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = userName;

        const countdownEl = document.getElementById('countdown');
        let remaining = countdownEl ? parseInt(countdownEl.textContent || '5', 10) : 5;
        if (Number.isNaN(remaining) || remaining <= 0) remaining = 5;

        const redirectHome = () => {
            window.location.href = '../index.html';
        };

        const timer = setInterval(() => {
            remaining -= 1;
            if (countdownEl) countdownEl.textContent = String(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                redirectHome();
            }
        }, 1000);

        const cancelLogout = document.getElementById('cancelLogout');
        if (cancelLogout) {
            cancelLogout.addEventListener('click', (e) => {
                e.preventDefault();
                clearInterval(timer);
                redirectHome();
            });
        }
        return;
    }

    // Check access for protected pages
    if (auth.redirectUnauthorized()) {
        return;
    }

    // Update UI based on authentication
    updateAuthUI();

    // Update cart count on all pages
    updateCartCount();
});

// Function to update cart count (can be called from other pages)
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount && auth.isUser()) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

// Function to add item to cart (can be called from other pages)
function addToCart(item) {
    if (!auth.isLoggedIn() || !auth.isUser()) {
        showAlert('Please login as a customer to add items to cart', 'warning');
        window.location.href = 'pages/login.html';
        return false;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(c => c.id === item.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showAlert(`${item.name} added to cart!`, 'success');
    return true;
}

// Function to remove item from cart
function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showAlert('Item removed from cart', 'success');
}

// Function to clear cart
function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
    showAlert('Cart cleared', 'success');
}

// Export auth instance for use in other files
window.auth = auth;
window.handleLogout = handleLogout;
window.showAlert = showAlert;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
