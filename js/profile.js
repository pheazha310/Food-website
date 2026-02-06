// js/profile.js
document.addEventListener('DOMContentLoaded', () => {
            if (auth.redirectUnauthorized()) return;
            updateAuthUI();
            updateCartCount();

            // DOM Elements
            const profileNavLinks = document.querySelectorAll('.profile-nav a');
            const profileTabs = document.querySelectorAll('.profile-tab');
            const editPersonalBtn = document.getElementById('editPersonalBtn');
            const cancelPersonalEdit = document.getElementById('cancelPersonalEdit');
            const savePersonalInfo = document.getElementById('savePersonalInfo');
            const editFields = document.querySelectorAll('.edit-field');
            const infoValues = document.querySelectorAll('.info-value');
            const personalActions = document.getElementById('personalActions');
            const addAddressBtn = document.getElementById('addAddressBtn');
            const addressesContainer = document.getElementById('addressesContainer');
            const emptyAddressesMessage = document.getElementById('emptyAddressesMessage');
            const addressModal = document.getElementById('addressModal');
            const addressForm = document.getElementById('addressForm');
            const closeModalBtns = document.querySelectorAll('.close-modal');
            const savePreferences = document.getElementById('savePreferences');
            const changePassword = document.getElementById('changePassword');
            const saveNotifications = document.getElementById('saveNotifications');
            const avatarInput = document.getElementById('avatarInput');
            const avatarPhoto = document.getElementById('avatarPhoto');
            const avatarFallback = document.querySelector('.avatar-fallback');

            // Load user data
            loadProfileData();
            loadAddresses();
            loadPreferences();
            loadNotifications();

            // Event Listeners - Tab Navigation
            profileNavLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = link.dataset.tab;

                    // Update active nav link
                    profileNavLinks.forEach(l => l.parentElement.classList.remove('active'));
                    link.parentElement.classList.add('active');

                    // Show corresponding tab
                    profileTabs.forEach(tab => tab.classList.remove('active'));
                    document.getElementById(`${tabId}Tab`).classList.add('active');
                });
            });

            // Event Listeners - Personal Info
            if (editPersonalBtn) editPersonalBtn.addEventListener('click', () => {
                editFields.forEach(field => field.style.display = 'block');
                infoValues.forEach(value => value.style.display = 'none');
                editPersonalBtn.style.display = 'none';
                personalActions.style.display = 'flex';

                // Populate edit fields
                document.getElementById('editName').value = auth.currentUser.name;
                document.getElementById('editEmail').value = auth.currentUser.email;
                document.getElementById('editUsername').value = auth.currentUser.username;
                document.getElementById('editPhone').value = auth.currentUser.phone || '';
            });

            if (cancelPersonalEdit) cancelPersonalEdit.addEventListener('click', () => {
                editFields.forEach(field => field.style.display = 'none');
                infoValues.forEach(value => value.style.display = 'block');
                editPersonalBtn.style.display = 'block';
                personalActions.style.display = 'none';
            });

            if (savePersonalInfo) savePersonalInfo.addEventListener('click', () => {
                const updatedData = {
                    name: document.getElementById('editName').value,
                    email: document.getElementById('editEmail').value,
                    username: document.getElementById('editUsername').value,
                    phone: document.getElementById('editPhone').value
                };

                if (auth.updateProfile(updatedData)) {
                    loadProfileData();
                    cancelPersonalEdit.click();
                    showAlert('Profile updated successfully!', 'success');
                }
            });

            // Event Listeners - Addresses
            if (addAddressBtn) addAddressBtn.addEventListener('click', () => openAddressModal());

            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal());
            });

            if (addressForm) addressForm.addEventListener('submit', handleAddressSubmit);

            // Close modal on outside click
            if (addressModal) addressModal.addEventListener('click', (e) => {
                if (e.target === addressModal) {
                    closeModal();
                }
            });

            // Event Listeners - Preferences
            if (savePreferences) savePreferences.addEventListener('click', saveUserPreferences);

            // Event Listeners - Security
            if (changePassword) changePassword.addEventListener('click', handlePasswordChange);

            // Event Listeners - Notifications
            if (saveNotifications) saveNotifications.addEventListener('click', saveNotificationSettings);

            // Event Listeners - Avatar
            if (avatarInput) {
                avatarInput.addEventListener('change', handleAvatarChange);
            }

            // Logout handled globally in auth.js

            // Load profile data
            function loadProfileData() {
                if (!auth.currentUser) return;

                // Update profile sidebar
                document.getElementById('profileName').textContent = auth.currentUser.name;
                document.getElementById('profileEmail').textContent = auth.currentUser.email;
                document.getElementById('memberSince').textContent = new Date().getFullYear();

                // Update avatar
                if (avatarPhoto && avatarFallback) {
                    if (auth.currentUser.photo) {
                        avatarPhoto.src = auth.currentUser.photo;
                        avatarPhoto.style.display = 'block';
                        avatarFallback.style.display = 'none';
                    } else {
                        avatarPhoto.style.display = 'none';
                        avatarFallback.style.display = 'block';
                    }
                }

                // Update personal info
                document.getElementById('infoName').textContent = auth.currentUser.name;
                document.getElementById('infoEmail').textContent = auth.currentUser.email;
                document.getElementById('infoUsername').textContent = auth.currentUser.username;
                document.getElementById('infoPhone').textContent = auth.currentUser.phone || 'Not set';
                document.getElementById('infoRole').textContent = auth.currentUser.role.charAt(0).toUpperCase() + auth.currentUser.role.slice(1);
            }

            // Load addresses
            function loadAddresses() {
                const addresses = getAddresses();

                if (addresses.length === 0) {
                    emptyAddressesMessage.style.display = 'block';
                    addressesContainer.innerHTML = '';
                    return;
                }

                emptyAddressesMessage.style.display = 'none';

                addressesContainer.innerHTML = addresses.map(address => `
            <div class="address-card ${address.default ? 'default' : ''}">
                <div class="address-header">
                    <div class="address-name">
                        <h4>${address.name}</h4>
                        ${address.default ? '<span class="default-badge">Default</span>' : ''}
                    </div>
                    <div class="address-actions">
                        <button class="btn btn-secondary btn-sm edit-address" data-id="${address.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-address" data-id="${address.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="address-details">
                    <p>${address.fullAddress}</p>
                    <p>${address.city}, ${address.state} ${address.zipCode}</p>
                    <p>${address.country}</p>
                    ${address.phone ? `<p>Phone: ${address.phone}</p>` : ''}
                </div>
            </div>
        `).join('');
        
        // Add event listeners to address buttons
        document.querySelectorAll('.edit-address').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                editAddress(id);
            });
        });
        
        document.querySelectorAll('.delete-address').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                deleteAddress(id);
            });
        });
    }
    
    // Get addresses from localStorage
    function getAddresses() {
        const addresses = JSON.parse(localStorage.getItem('userAddresses')) || [];
        // Filter addresses for current user
        return addresses.filter(addr => addr.userId === auth.currentUser.id);
    }
    
    // Save addresses to localStorage
    function saveAddresses(addresses) {
        localStorage.setItem('userAddresses', JSON.stringify(addresses));
    }
    
    // Open address modal
    function openAddressModal(address = null) {
        const modalTitle = document.getElementById('addressModalTitle');
        
        if (address) {
            modalTitle.textContent = 'Edit Address';
            document.getElementById('addressId').value = address.id;
            document.getElementById('addressName').value = address.name;
            document.getElementById('fullAddress').value = address.fullAddress;
            document.getElementById('city').value = address.city;
            document.getElementById('state').value = address.state;
            document.getElementById('zipCode').value = address.zipCode;
            document.getElementById('country').value = address.country;
            document.getElementById('phoneNumber').value = address.phone || '';
            document.getElementById('defaultAddress').checked = address.default || false;
        } else {
            modalTitle.textContent = 'Add New Address';
            addressForm.reset();
            document.getElementById('addressId').value = '';
            document.getElementById('country').value = 'USA';
        }
        
        addressModal.classList.add('active');
    }
    
    // Close modal
    function closeModal() {
        addressModal.classList.remove('active');
        addressForm.reset();
    }
    
    // Handle address submission
    function handleAddressSubmit(e) {
        e.preventDefault();
        
        const addressData = {
            id: document.getElementById('addressId').value || Date.now(),
            userId: auth.currentUser.id,
            name: document.getElementById('addressName').value,
            fullAddress: document.getElementById('fullAddress').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value,
            phone: document.getElementById('phoneNumber').value || null,
            default: document.getElementById('defaultAddress').checked
        };
        
        let addresses = getAddresses();
        
        // If setting as default, remove default from other addresses
        if (addressData.default) {
            addresses = addresses.map(addr => ({
                ...addr,
                default: false
            }));
        }
        
        // Update or add address
        const existingIndex = addresses.findIndex(addr => addr.id == addressData.id);
        
        if (existingIndex !== -1) {
            addresses[existingIndex] = addressData;
        } else {
            addresses.push(addressData);
        }
        
        saveAddresses(addresses);
        closeModal();
        loadAddresses();
        showAlert('Address saved successfully!', 'success');
    }
    
    // Edit address
    function editAddress(id) {
        const addresses = getAddresses();
        const address = addresses.find(addr => addr.id === id);
        if (address) {
            openAddressModal(address);
        }
    }
    
    // Delete address
    function deleteAddress(id) {
        if (!confirm('Are you sure you want to delete this address?')) return;
        
        let addresses = getAddresses();
        addresses = addresses.filter(addr => addr.id !== id);
        
        // If deleting default address, set another as default
        const deletedWasDefault = addresses.find(addr => addr.id === id)?.default;
        if (deletedWasDefault && addresses.length > 0) {
            addresses[0].default = true;
        }
        
        saveAddresses(addresses);
        loadAddresses();
        showAlert('Address deleted successfully!', 'success');
    }
    
    // Load preferences
    function loadPreferences() {
        const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        const userPrefs = preferences[auth.currentUser.id] || {};
        
        // Set cuisine preferences
        const cuisines = userPrefs.cuisines || ['italian'];
        document.querySelectorAll('input[name="cuisine"]').forEach(checkbox => {
            checkbox.checked = cuisines.includes(checkbox.value);
        });
        
        // Set spice level
        if (userPrefs.spiceLevel) {
            document.getElementById('spiceLevel').value = userPrefs.spiceLevel;
        }
        
        // Set dietary restrictions
        const diets = userPrefs.diets || [];
        document.querySelectorAll('input[name="diet"]').forEach(checkbox => {
            checkbox.checked = diets.includes(checkbox.value);
        });
    }
    
    // Save preferences
    function saveUserPreferences() {
        const cuisines = Array.from(document.querySelectorAll('input[name="cuisine"]:checked'))
            .map(cb => cb.value);
        
        const spiceLevel = document.getElementById('spiceLevel').value;
        
        const diets = Array.from(document.querySelectorAll('input[name="diet"]:checked'))
            .map(cb => cb.value);
        
        const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        preferences[auth.currentUser.id] = {
            cuisines,
            spiceLevel,
            diets,
            updated: new Date().toISOString()
        };
        
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        showAlert('Preferences saved successfully!', 'success');
    }
    
    // Handle password change
    function handlePasswordChange() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('Please fill in all password fields', 'danger');
            return;
        }
        
        if (newPassword.length < 8) {
            showAlert('New password must be at least 8 characters long', 'danger');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match', 'danger');
            return;
        }
        
        // Check current password
        if (currentPassword !== auth.currentUser.password) {
            showAlert('Current password is incorrect', 'danger');
            return;
        }
        
        // Update password
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === auth.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            auth.currentUser.password = newPassword;
            
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(auth.currentUser));
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            showAlert('Password changed successfully!', 'success');
        }
    }

    function handleAvatarChange(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showAlert('Please select an image file', 'danger');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showAlert('Image must be under 2MB', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (auth.updateProfile({ photo: dataUrl })) {
                loadProfileData();
                showAlert('Profile photo updated!', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
    
    // Load notification settings
    function loadNotifications() {
        const notifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
        const userNotifs = notifications[auth.currentUser.id] || {
            emailNotifications: true,
            smsNotifications: false,
            promoEmails: true,
            orderUpdates: true
        };
        
        document.getElementById('emailNotifications').checked = userNotifs.emailNotifications;
        document.getElementById('smsNotifications').checked = userNotifs.smsNotifications;
        document.getElementById('promoEmails').checked = userNotifs.promoEmails;
        document.getElementById('orderUpdates').checked = userNotifs.orderUpdates;
    }
    
    // Save notification settings
    function saveNotificationSettings() {
        const notifications = JSON.parse(localStorage.getItem('userNotifications')) || {};
        notifications[auth.currentUser.id] = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            promoEmails: document.getElementById('promoEmails').checked,
            orderUpdates: document.getElementById('orderUpdates').checked,
            updated: new Date().toISOString()
        };
        
        localStorage.setItem('userNotifications', JSON.stringify(notifications));
        showAlert('Notification settings saved successfully!', 'success');
    }
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
