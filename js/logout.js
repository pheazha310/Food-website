// Add this function to auth.js to handle logout page redirect
function handleLogoutRedirect() {
    // Only redirect if we're on the logout page
    if (window.location.pathname.includes('logout.html')) {
        // If user is logged in, let them stay on logout page
        if (auth.isLoggedIn()) {
            return;
        }
        // If user is not logged in, redirect to home
        window.location.href = '../index.html';
    }
}

// Update the DOMContentLoaded event listener in auth.js
document.addEventListener('DOMContentLoaded', () => {
    // Handle logout page redirect
    handleLogoutRedirect();

    // Check access for protected pages
    if (auth.redirectUnauthorized()) {
        return;
    }

    // Update UI based on authentication
    updateAuthUI();
});

// Update the logout function in the Auth class
class Auth {
    // ... existing code ...

    logout() {
        const userName = this.currentUser ? this.currentUser.name : 'User';
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Optional: Clear cart on logout for security
        if (this.isUser()) {
            localStorage.removeItem('cart');
        }

        // Return user name for logout page display
        return userName;
    }

    // ... existing code ...
}

// Update the handleLogout function in auth.js
function handleLogout() {
    const userName = auth.logout();

    // If we're already on the logout page, don't redirect
    if (window.location.pathname.includes('logout.html')) {
        // Just refresh the page to show logout completion
        window.location.reload();
        return;
    }

    // Otherwise, redirect to logout page
    window.location.href = 'pages/logout.html';
}

// Update the updateAuthUI function to use the new handleLogout
function updateAuthUI() {
    const loginBtn = document.querySelector('a[href="pages/login.html"]');
    const registerBtn = document.querySelector('a[href="pages/register.html"]');
    const logoutBtn = document.getElementById('logoutBtn');
    const userGreeting = document.getElementById('userGreeting');

    if (auth.isLoggedIn()) {
        // Update login button to logout
        if (loginBtn && !window.location.pathname.includes('logout.html')) {
            loginBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
            loginBtn.href = 'pages/logout.html';
            loginBtn.onclick = null; // Remove onclick since we're using href
        }

        // Hide register button if logged in
        if (registerBtn && !window.location.pathname.includes('logout.html')) {
            registerBtn.style.display = 'none';
        }

        // Show logout button if it exists (for admin pages)
        if (logoutBtn && !window.location.pathname.includes('logout.html')) {
            logoutBtn.style.display = 'block';
            logoutBtn.href = 'logout.html';
            logoutBtn.onclick = null;
        }

        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${auth.currentUser.name}`;
        }

        // ... rest of existing updateAuthUI code ...
    } else {
        // User is not logged in
        if (loginBtn && !window.location.pathname.includes('logout.html')) {
            loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login`;
            loginBtn.href = 'pages/login.html';
            loginBtn.onclick = null;
        }

        // Show register button
        if (registerBtn && !window.location.pathname.includes('logout.html')) {
            registerBtn.style.display = 'block';
        }

        // Hide logout button
        if (logoutBtn && !window.location.pathname.includes('logout.html')) {
            logoutBtn.style.display = 'none';
        }

        // ... rest of existing updateAuthUI code ...
    }
}