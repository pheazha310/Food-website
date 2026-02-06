// js/cart.js
document.addEventListener('DOMContentLoaded', () => {
            if (auth.redirectUnauthorized()) return;
            updateAuthUI();
            updateCartCount();

            // DOM Elements
            const cartItemsContainer = document.getElementById('cartItemsContainer');
            const emptyCartMessage = document.getElementById('emptyCartMessage');
            const itemCount = document.getElementById('itemCount');
            const subtotal = document.getElementById('subtotal');
            const tax = document.getElementById('tax');
            const totalAmount = document.getElementById('totalAmount');
            const clearCartBtn = document.getElementById('clearCartBtn');
            const checkoutBtn = document.getElementById('checkoutBtn');
            const checkoutModal = document.getElementById('checkoutModal');
            const checkoutForm = document.getElementById('checkoutForm');
            const closeModalBtns = document.querySelectorAll('.close-modal');
            const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
            const applyPromoBtn = document.getElementById('applyPromo');

            // Event Listeners
            if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
            if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal());
            });

            ``
            `javascript
            // js/cart.js
            document.addEventListener('DOMContentLoaded', () => {
                        if (auth.redirectUnauthorized()) return;
                        updateAuthUI();
                        updateCartCount();

                        // DOM Elements
                        const cartItemsContainer = document.getElementById('cartItemsContainer');
                        const emptyCartMessage = document.getElementById('emptyCartMessage');
                        const itemCount = document.getElementById('itemCount');
                        const subtotal = document.getElementById('subtotal');
                        const tax = document.getElementById('tax');
                        const totalAmount = document.getElementById('totalAmount');
                        const clearCartBtn = document.getElementById('clearCartBtn');
                        const checkoutBtn = document.getElementById('checkoutBtn');
                        const checkoutModal = document.getElementById('checkoutModal');
                        const checkoutForm = document.getElementById('checkoutForm');
                        const closeModalBtns = document.querySelectorAll('.close-modal');
                        const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
                        const applyPromoBtn = document.getElementById('applyPromo');

                        // Event Listeners
                        clearCartBtn?.addEventListener('click', clearCart);
                        checkoutBtn?.addEventListener('click', openCheckoutModal);

                        closeModalBtns.forEach(btn => {
                            btn.addEventListener('click', () => closeModal());
                        });

                        checkoutForm?.addEventListener('submit', handleCheckout);

                        deliveryOptions.forEach(option => {
                            option.addEventListener('change', updateOrderSummary);
                        });

                        applyPromoBtn?.addEventListener('click', applyPromoCode);

                        // Close modal on outside click
                        checkoutModal?.addEventListener('click', (e) => {
                                    if (e.target === checkoutModal) {
                                        closeModal();
                                    }
                        });

                        // Load cart items
                        loadCartItems();

                        // Load cart items
                        function loadCartItems() {
                            const cart = getCart();

                            if (cart.length === 0) {
                                emptyCartMessage.style.display = 'block';
                                cartItemsContainer.innerHTML = '';
                                updateOrderSummary();
                                return;
                            }

                            emptyCartMessage.style.display = 'none';

                            cartItemsContainer.innerHTML = cart.map(item => ` <
            div class = "cart-item"
            data - id = "${item.id}" >
                <
                div class = "cart-item-image" >
                <
                img src = "${item.image}"
            alt = "${item.name}" >
                <
                /div>

            <
            div class = "cart-item-details" >
                <
                div class = "cart-item-info" >
                <
                div class = "cart-item-name" > $ { item.name } < /div> <
            div class = "cart-item-description" > $ { item.description } < /div> < /
            div > <
                div class = "cart-item-price" > $$ {
                    (item.price * item.quantity).toFixed(2)
                } < /div> < /
            div >

                <
                div class = "cart-item-controls" >
                <
                div class = "quantity-controls" >
                <
                button class = "quantity-btn decrease"
            data - id = "${item.id}" > - < /button> <
            input type = "number"
            class = "quantity-input"
            value = "${item.quantity}"
            min = "1"
            data - id = "${item.id}" >
                <
                button class = "quantity-btn increase"
            data - id = "${item.id}" > + < /button> < /
            div > <
                button class = "remove-item"
            data - id = "${item.id}" >
                <
                i class = "fas fa-trash" > < /i> Remove < /
            button > <
                /div> < /
            div >
                `).join('');

                            // Add event listeners
                            document.querySelectorAll('.quantity-btn').forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const id = parseInt(e.target.dataset.id);
                                    const action = e.target.classList.contains('increase') ? 'increase' : 'decrease';
                                    updateQuantity(id, action);
                                });
                            });

                            document.querySelectorAll('.quantity-input').forEach(input => {
                                input.addEventListener('change', (e) => {
                                    const id = parseInt(e.target.dataset.id);
                                    const quantity = parseInt(e.target.value) || 1;
                                    updateQuantity(id, 'set', quantity);
                                });
                            });

                            document.querySelectorAll('.remove-item').forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const id = parseInt(e.target.closest('.remove-item').dataset.id);
                                    removeItem(id);
                                });
                            });

                            updateOrderSummary();
                        }

                        // Get cart from localStorage
                        function getCart() {
                            return JSON.parse(localStorage.getItem('cart')) || [];
                        }

                        // Save cart to localStorage
                        function saveCart(cart) {
                            localStorage.setItem('cart', JSON.stringify(cart));
                            updateCartCount();
                        }

                        // Update quantity
                        function updateQuantity(id, action, value = null) {
                            let cart = getCart();
                            const item = cart.find(item => item.id === id);

                            if (!item) return;

                            switch (action) {
                                case 'increase':
                                    item.quantity += 1;
                                    break;
                                case 'decrease':
                                    if (item.quantity > 1) {
                                        item.quantity -= 1;
                                    }
                                    break;
                                case 'set':
                                    item.quantity = Math.max(1, value);
                                    break;
                            }

                            saveCart(cart);
                            loadCartItems();
                        }

                        // Remove item from cart
                        function removeItem(id) {
                            if (!confirm('Remove this item from cart?')) return;

                            let cart = getCart();
                            cart = cart.filter(item => item.id !== id);
                            saveCart(cart);
                            loadCartItems();
                        }

                        // Clear cart
                        function clearCart() {
                            if (!confirm('Clear all items from cart?')) return;

                            saveCart([]);
                            loadCartItems();
                            showAlert('Cart cleared successfully!', 'success');
                        }

                        // Update order summary
                        function updateOrderSummary() {
                            const cart = getCart();
                            const deliveryOption = document.querySelector('input[name="delivery"]:checked')?.value;
                            const deliveryFee = deliveryOption === 'pickup' ? 0 : 2.99;

                            // Calculate subtotal
                            const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                            // Calculate tax (8.5%)
                            const taxAmount = subtotalAmount * 0.085;

                            // Calculate total
                            const total = subtotalAmount + deliveryFee + taxAmount;

                            // Update UI
                            if (itemCount) itemCount.textContent = cart.length;
                            if (subtotal) subtotal.textContent = `
            $$ { subtotalAmount.toFixed(2) }
            `;
                            if (tax) tax.textContent = `
            $$ { taxAmount.toFixed(2) }
            `;
                            document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'FREE' : `
            $$ { deliveryFee.toFixed(2) }
            `;
                            if (totalAmount) totalAmount.textContent = `
            $$ { total.toFixed(2) }
            `;

                            // Disable checkout if cart is empty
                            if (checkoutBtn) {
                                checkoutBtn.disabled = cart.length === 0;
                            }
                        }

                        // Apply promo code
                        function applyPromoCode() {
                            const promoCode = document.getElementById('promoCode').value;

                            if (!promoCode) {
                                showAlert('Please enter a promo code', 'danger');
                                return;
                            }

                            // Simple promo codes for demo
                            const promoCodes = {
                                'WELCOME10': 0.10,
                                'SAVE15': 0.15,
                                'FOOD20': 0.20
                            };

                            if (promoCodes[promoCode.toUpperCase()]) {
                                const discount = promoCodes[promoCode.toUpperCase()];
                                showAlert(`
            Promo code applied!$ { discount * 100 } % discount `, 'success');
                                // In a real app, apply the discount to calculations
                            } else {
                                showAlert('Invalid promo code', 'danger');
                            }
                        }

                        // Open checkout modal
                        function openCheckoutModal() {
                            checkoutModal.classList.add('active');
                        }

                        // Close modal
                        function closeModal() {
                            checkoutModal.classList.remove('active');
                            checkoutForm.reset();
                        }

                        // Handle checkout
                        function handleCheckout(e) {
                            e.preventDefault();

                            const cart = getCart();

                            if (cart.length === 0) {
                                showAlert('Your cart is empty', 'danger');
                                return;
                            }

                            const orderData = {
                                id: Date.now(),
                                items: [...cart],
                                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                                deliveryFee: document.querySelector('input[name="delivery"]:checked')?.value === 'pickup' ? 0 : 2.99,
                                tax: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.085,
                                total: calculateTotal(cart),
                                deliveryAddress: document.getElementById('deliveryAddress').value,
                                phoneNumber: document.getElementById('phoneNumber').value,
                                deliveryTime: document.getElementById('deliveryTime').value,
                                specialInstructions: document.getElementById('specialInstructions').value,
                                paymentMethod: document.getElementById('paymentMethod').value,
                                status: 'pending',
                                date: new Date().toISOString(),
                                customerId: auth.currentUser?.id,
                                customerName: auth.currentUser?.name,
                            };

                            // Save order
                            let orders = JSON.parse(localStorage.getItem('orders')) || [];
                            orders.push(orderData);
                            localStorage.setItem('orders', JSON.stringify(orders));

                            // Clear cart
                            saveCart([]);

                            // Close modal
                            closeModal();

                            // Show success message
                            showAlert('Order placed successfully!', 'success');

                            // Redirect to order history
                            setTimeout(() => {
                                window.location.href = 'order-history.html';
                            }, 2000);
                        }

                        // Calculate total
                        function calculateTotal(cart) {
                            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                            const deliveryFee = document.querySelector('input[name="delivery"]:checked')?.value === 'pickup' ? 0 : 2.99;
                            const tax = subtotal * 0.085;
                            return subtotal + deliveryFee + tax;
                        }

                        // Logout
                        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                            e.preventDefault();
                            auth.logout();
                            window.location.href = '../index.html';
                        });

                        function showAlert(message, type) {
                            const alertDiv = document.createElement('div');
                            alertDiv.className = `
            alert alert - $ { type }
            `;
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
            `
            ``