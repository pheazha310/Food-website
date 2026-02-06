// js/strategy.js
document.addEventListener('DOMContentLoaded', () => {
            if (auth.redirectUnauthorized()) return;
            updateAuthUI();

            const strategyManager = new StrategyManager();

            // DOM Elements
            const strategiesContainer = document.getElementById('strategiesContainer');
            const addStrategyBtn = document.getElementById('addStrategyBtn');
            const strategyModal = document.getElementById('strategyModal');
            const strategyForm = document.getElementById('strategyForm');
            const closeModalBtns = document.querySelectorAll('.close-modal');
            const statusFilter = document.getElementById('statusFilter');
            const searchStrategy = document.getElementById('searchStrategy');

            let editingStrategyId = null;

            // Event Listeners
            if (addStrategyBtn) addStrategyBtn.addEventListener('click', () => openModal());

            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', () => closeModal());
            });


            if (strategyForm) strategyForm.addEventListener('submit', handleStrategySubmit);

            if (statusFilter) statusFilter.addEventListener('change', loadStrategies);
            if (searchStrategy) searchStrategy.addEventListener('input', loadStrategies);

            // Close modal on outside click
            if (strategyModal) strategyModal.addEventListener('click', (e) => {
                if (e.target === strategyModal) {
                    closeModal();
                }
            });

            // Load initial strategies
            loadStrategies();

            // Strategy Manager Class
            function StrategyManager() {
                this.getStrategies = () => {
                    return JSON.parse(localStorage.getItem('strategies')) || [];
                };

                this.saveStrategies = (strategies) => {
                    localStorage.setItem('strategies', JSON.stringify(strategies));
                };

                this.createStrategy = (strategy) => {
                    const strategies = this.getStrategies();
                    const newStrategy = {
                        id: Date.now(),
                        ...strategy,
                        created: new Date().toISOString().split('T')[0],
                        createdBy: auth.currentUser ? auth.currentUser.name : 'Admin'
                    };
                    strategies.push(newStrategy);
                    this.saveStrategies(strategies);
                    return newStrategy;
                };

                this.updateStrategy = (id, updates) => {
                    const strategies = this.getStrategies();
                    const index = strategies.findIndex(s => s.id === id);
                    if (index !== -1) {
                        strategies[index] = {...strategies[index], ...updates };
                        this.saveStrategies(strategies);
                        return true;
                    }
                    return false;
                };

                this.deleteStrategy = (id) => {
                    const strategies = this.getStrategies();
                    const filtered = strategies.filter(s => s.id !== id);
                    this.saveStrategies(filtered);
                };

                this.getStrategyById = (id) => {
                    const strategies = this.getStrategies();
                    return strategies.find(s => s.id === id);
                };
            }

            // Load strategies with filtering
            function loadStrategies() {
                const strategies = strategyManager.getStrategies();
                const status = statusFilter ? statusFilter.value : 'all';
                const search = searchStrategy ? (searchStrategy.value ? searchStrategy.value.toLowerCase() : '') : '';

                let filtered = strategies;

                if (status !== 'all') {
                    filtered = filtered.filter(s => s.status === status);
                }

                if (search) {
                    filtered = filtered.filter(s =>
                        s.title.toLowerCase().includes(search) ||
                        s.description.toLowerCase().includes(search)
                    );
                }

                displayStrategies(filtered);
            }

            // Display strategies in grid
            function displayStrategies(strategies) {
                if (!strategiesContainer) return;

                strategiesContainer.innerHTML = strategies.map(strategy => `
            <div class="strategy-card ${strategy.status}">
                <div class="strategy-card-header">
                    <h3>${strategy.title}</h3>
                    <span class="strategy-status status-${strategy.status}">
                        ${strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                    </span>
                </div>
                
                <div class="strategy-card-body">
                    <p>${strategy.description}</p>
                </div>
                
                <div class="strategy-card-footer">
                    <div class="strategy-meta">
                        <div>Created: ${strategy.created}</div>
                        ${strategy.deadline ? `<div>Deadline: ${strategy.deadline}</div>` : ''}
                        <div>Priority: ${strategy.priority || 'medium'}</div>
                    </div>
                    
                    <div class="strategy-actions">
                        <button class="btn btn-secondary btn-sm edit-strategy" data-id="${strategy.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-strategy" data-id="${strategy.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.edit-strategy').dataset.id);
                editStrategy(id);
            });
        });
        
        document.querySelectorAll('.delete-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.delete-strategy').dataset.id);
                deleteStrategy(id);
            });
        });
    }
    
    // Open modal for adding/editing
    function openModal(strategy = null) {
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('strategyForm');
        
        if (strategy) {
            modalTitle.textContent = 'Edit Strategy';
            document.getElementById('strategyId').value = strategy.id;
            document.getElementById('strategyTitle').value = strategy.title;
            document.getElementById('strategyDescription').value = strategy.description;
            document.getElementById('strategyStatus').value = strategy.status;
            document.getElementById('strategyPriority').value = strategy.priority || 'medium';
            document.getElementById('strategyDeadline').value = strategy.deadline || '';
            editingStrategyId = strategy.id;
        } else {
            modalTitle.textContent = 'Add New Strategy';
            form.reset();
            document.getElementById('strategyId').value = '';
            editingStrategyId = null;
        }
        
        strategyModal.classList.add('active');
    }
    
    // Close modal
    function closeModal() {
        strategyModal.classList.remove('active');
        strategyForm.reset();
        editingStrategyId = null;
    }
    
    // Handle form submission
    function handleStrategySubmit(e) {
        e.preventDefault();
        
        const strategyData = {
            title: document.getElementById('strategyTitle').value,
            description: document.getElementById('strategyDescription').value,
            status: document.getElementById('strategyStatus').value,
            priority: document.getElementById('strategyPriority').value,
            deadline: document.getElementById('strategyDeadline').value || null
        };
        
        if (editingStrategyId) {
            // Update existing strategy
            const success = strategyManager.updateStrategy(editingStrategyId, strategyData);
            if (success) {
                showAlert('Strategy updated successfully!', 'success');
            }
        } else {
            // Create new strategy
            strategyManager.createStrategy(strategyData);
            showAlert('Strategy created successfully!', 'success');
        }
        
        closeModal();
        loadStrategies();
    }
    
    // Edit strategy
    function editStrategy(id) {
        const strategy = strategyManager.getStrategyById(id);
        if (strategy) {
            openModal(strategy);
        }
    }
    
    // Delete strategy
    function deleteStrategy(id) {
        if (confirm('Are you sure you want to delete this strategy?')) {
            strategyManager.deleteStrategy(id);
            showAlert('Strategy deleted successfully!', 'success');
            loadStrategies();
        }
    }
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
        window.location.href = '../index.html';
    });
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