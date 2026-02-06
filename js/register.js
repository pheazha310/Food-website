// js/register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const successModal = document.getElementById('successModal');
    const googleBtn = document.querySelector('.btn-google');
    const facebookBtn = document.querySelector('.btn-facebook');

    // Form submission
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // Social login buttons (demo functionality)
    if (googleBtn) googleBtn.addEventListener('click', () => {
        showAlert('Google signup integration would go here in a real application', 'info');
    });

    if (facebookBtn) facebookBtn.addEventListener('click', () => {
        showAlert('Facebook signup integration would go here in a real application', 'info');
    });

    // Close modal on outside click
    if (successModal) successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // Initialize form validation
    initializeFormValidation();
});

function initializeFormValidation() {
    const form = document.getElementById('registerForm');
    const inputs = form ? form.querySelectorAll('input[required], textarea[required]') : [];

    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    switch (field.id) {
        case 'firstName':
        case 'lastName':
            if (value.length < 2) {
                isValid = false;
                message = 'Name must be at least 2 characters';
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
            break;

        case 'username':
            if (value.length < 3) {
                isValid = false;
                message = 'Username must be at least 3 characters';
            }
            break;

        case 'password':
            if (value.length < 8) {
                isValid = false;
                message = 'Password must be at least 8 characters';
            }
            break;

        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (value !== password) {
                isValid = false;
                message = 'Passwords do not match';
            }
            break;

        case 'phone':
            if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
            break;
    }

    if (!isValid) {
        showFieldError(field, message);
    }

    return isValid;
}

function showFieldError(field, message) {
    clearError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '5px';

    field.style.borderColor = '#dc3545';
    field.parentNode.appendChild(errorDiv);
}

function clearError(field) {
    field.style.borderColor = '#e0e0e0';
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function handleRegister(e) {
    e.preventDefault();

    // Validate all fields
    const form = document.getElementById('registerForm');
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });

    if (!allValid) {
        showAlert('Please fix the errors in the form', 'danger');
        return;
    }

    // Check terms agreement
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        showAlert('You must agree to the Terms of Service', 'danger');
        return;
    }

    // Collect form data
    const userData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        name: `${document.getElementById('firstName').value.trim()} ${document.getElementById('lastName').value.trim()}`,
        email: document.getElementById('email').value.trim(),
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value.trim() || null,
        address: document.getElementById('address').value.trim() || null,
        newsletter: document.getElementById('newsletter').checked,
        role: 'user',
        registered: new Date().toISOString()
    };

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.email === userData.email || u.username === userData.username);

    if (userExists) {
        showAlert('A user with this email or username already exists', 'danger');
        return;
    }

    // Register user
    const result = auth.register(userData);

    if (result.success) {
        // Save user preferences if newsletter is checked
        if (userData.newsletter) {
            const notifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
            notifications[result.user.id] = {
                emailNotifications: true,
                smsNotifications: false,
                promoEmails: true,
                orderUpdates: true,
                updated: new Date().toISOString()
            };
            localStorage.setItem('userNotifications', JSON.stringify(notifications));
        }

        // Show success modal
        showSuccessModal();

        // Clear form
        form.reset();
    } else {
        showAlert(result.message, 'danger');
    }
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) modal.classList.add('active');
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