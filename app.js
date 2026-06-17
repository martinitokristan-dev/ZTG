// Shared Data Management & State logic for ZTG Parts POS

// 1. Initial Seed Data
const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Hydraulic Pump', chineseName: '液压泵', partNo: 'HP-001', category: 'Hydraulics', address: 'A-12-3', stock: 45, price1: 2500, price2: 2750, salesCount: 127, status: 'Active', damaged: 0, variants: ['Standard', 'Heavy Duty'] },
    { id: 2, name: 'Engine Oil Filter', chineseName: '发动机机油滤芯', partNo: 'EOF-102', category: 'Filters', address: 'B-04-1', stock: 103, price1: 850, price2: 920, salesCount: 412, status: 'Active', damaged: 2, variants: ['Small', 'Large'] },
    { id: 3, name: 'Track Link Assembly', chineseName: '履带链节总成', partNo: 'TRK-003', category: 'Undercarriage', address: 'C-08-2', stock: 0, price1: 1200, price2: 1350, salesCount: 89, status: 'No Stock', damaged: 0 },
    { id: 4, name: 'Engine Gasket Set', chineseName: '发动机垫片组', partNo: 'ENG-005', category: 'Engine', address: 'D-03-4', stock: 3, price1: 980, price2: 1100, salesCount: 156, status: 'Low Stock', damaged: 0 },
    { id: 5, name: 'Alternator 24V', chineseName: '24V交流发电机', partNo: 'ELE-006', category: 'Electrical', address: 'E-05-1', stock: 0, price1: 3200, price2: 3500, salesCount: 67, status: 'No Stock', damaged: 1, variants: ['Standard', 'Premium'] },
    { id: 6, name: 'Fuel Filter Primary', chineseName: '主燃油滤清器', partNo: 'FLT-008', category: 'Filters', address: 'B-07-2', stock: 1, price1: 450, price2: 520, salesCount: 298, status: 'Low Stock', damaged: 0 },
    { id: 7, name: 'Bucket Cylinder', chineseName: '铲斗油缸', partNo: 'BC-104', category: 'Hydraulics', address: 'A-15-2', stock: 15, price1: 4500, price2: 4900, salesCount: 42, status: 'Active', damaged: 0 },
    { id: 8, name: 'Rubber Track 400mm', chineseName: '橡胶履带400mm', partNo: 'RT-400', category: 'Undercarriage', address: 'C-10-1', stock: 8, price1: 8500, price2: 9200, salesCount: 28, status: 'Active', damaged: 0, variants: ['300mm width', '400mm width', '500mm width'] }
];

const DEFAULT_EMPLOYEES = [
    { id: 'EMP-001', name: 'Maria Santos', role: 'Cashier', status: 'Active', commissionRate: '5%' },
    { id: 'EMP-002', name: 'Carlos Dizon', role: 'Cashier', status: 'Active', commissionRate: '5%' },
    { id: 'EMP-003', name: 'Joey Ramos', role: 'Cashier', status: 'Active', commissionRate: '5%' },
    { id: 'EMP-004', name: 'Ana Cruz', role: 'Cashier', status: 'Active', commissionRate: '5%' },
    { id: 'EMP-005', name: 'Pedro Gonzales', role: 'Checker', status: 'Active', commissionRate: 'N/A' }
];

const DEFAULT_PENDING_POS = [
    { poNo: 'PO-2026-018', date: 'Jun 14, 2026 30 mins ago', customer: 'Juan dela Cruz', phone: '09XX-XXX-1234', itemsCount: 4, total: 15200, docType: 'S.I.', cashier: 'Maria Santos', status: 'Urgent', items: [{ id: 1, qty: 4, price: 2500 }, { id: 2, qty: 6, price: 850 }] },
    { poNo: 'PO-2026-017', date: 'Jun 14, 2026 1 hour ago', customer: 'ABC Construction Corp.', phone: '09XX-XXX-5678', itemsCount: 8, total: 24500, docType: 'D.R.', cashier: 'Carlos Dizon', status: 'Pending', items: [{ id: 7, qty: 5, price: 4500 }, { id: 6, qty: 4, price: 450 }] },
    { poNo: 'PO-2026-016', date: 'Jun 14, 2026 2 hours ago', customer: 'Rosa Martinez', phone: '09XX-XXX-9012', itemsCount: 3, total: 8750, docType: 'C.I.', cashier: 'Joey Ramos', status: 'Pending', items: [{ id: 2, qty: 10, price: 850 }] },
    { poNo: 'PO-2026-015', date: 'Jun 14, 2026 3 hours ago', customer: 'Pedro Gonzales', phone: '09XX-XXX-3456', itemsCount: 2, total: 5300, docType: 'S.I.', cashier: 'Ana Cruz', status: 'Pending', items: [{ id: 1, qty: 2, price: 2500 }] },
    { poNo: 'PO-2026-014', date: 'Jun 13, 2026 Yesterday', customer: 'Linda Fernandez', phone: '09XX-XXX-7890', itemsCount: 5, total: 12400, docType: 'S.I.', cashier: 'Maria Santos', status: 'Pending', items: [{ id: 4, qty: 5, price: 980 }] },
    { poNo: 'PO-2026-013', date: 'Jun 13, 2026 Yesterday', customer: 'Ricardo Buenaventura', phone: '09XX-XXX-2345', itemsCount: 1, total: 3850, docType: 'C.I.', cashier: 'Carlos Dizon', status: 'Pending', items: [{ id: 2, qty: 4, price: 850 }] },
    { poNo: 'PO-2026-012', date: 'Jun 13, 2026 Yesterday', customer: 'Teresa Gomez', phone: '09XX-XXX-6789', itemsCount: 6, total: 18200, docType: 'D.R.', cashier: 'Joey Ramos', status: 'Pending', items: [{ id: 7, qty: 4, price: 4500 }] },
    { poNo: 'PO-2026-011', date: 'Jun 13, 2026 2 days ago', customer: 'Miguel Santos', phone: '09XX-XXX-4567', itemsCount: 3, total: 7250, docType: 'S.I.', cashier: 'Ana Cruz', status: 'Pending', items: [{ id: 1, qty: 2, price: 2500 }] }
];

const DEFAULT_TRANSACTIONS = [
    { siNo: 'SI-2025-041', date: 'Jun 14, 2026', itemName: 'Hydraulic Pump', customer: 'Juan dela Cruz', qty: 2, amount: 5000, payment: 'Cash', cashier: 'Maria Santos', status: 'Completed', phone: '09XX-XXX-1234' },
    { siNo: 'SI-2025-040', date: 'Jun 14, 2026', itemName: 'Engine Oil Filter', customer: 'Roberto Reyes', qty: 1, amount: 850, payment: 'GCash', cashier: 'Carlos Dizon', status: 'Refund', phone: '09XX-XXX-2222', refundReason: 'Wrong item size compatibility', actionType: 'Refunded to E-wallet', invAction: 'Restocked to Shelf' },
    { siNo: 'CI-2025-039', date: 'Jun 13, 2026', itemName: 'Bucket Cylinder', customer: 'Perla Gomez', qty: 1, amount: 4500, payment: 'Bank', cashier: 'Maria Santos', status: 'Return', phone: '09XX-XXX-3333', refundReason: 'Damaged seal ring', actionType: 'Replaced Item', invAction: 'Moved to Scrap/Damaged' },
    { siNo: 'DR-2025-038', date: 'Jun 13, 2026', itemName: 'Rubber Track 400mm', customer: 'Alex Buenaventura', qty: 2, amount: 17000, payment: 'P.O. (Pending)', cashier: 'Joey Ramos', status: 'Pending', phone: '09XX-XXX-4444' }
];

const DEFAULT_RESERVATIONS = [
    { id: 'RES-001', item: 'Hydraulic Pump', customer: 'Mark Anthony', phone: '0917-888-9999', qty: 1, deposit: 1000, total: 2500, date: 'Jun 14, 2026', pickupDate: 'Jun 18, 2026', status: 'Pending' },
    { id: 'RES-002', item: 'Rubber Track 400mm', customer: 'Golden State Builders', phone: '0922-333-4444', qty: 2, deposit: 5000, total: 17000, date: 'Jun 13, 2026', pickupDate: 'Jun 20, 2026', status: 'Completed' }
];

const DEFAULT_ARCHIVES = [
    { id: 'RES-009', type: 'Reservation Cancellation', details: 'Customer: Juan Dela Cruz cancelled reservation for Hydraulic Pump (Qty 1). Deposit returned: ₱1,000. Reason: Project budget constraints.', dateArchived: 'Jun 14, 2026' },
    { id: 'PO-2026-004', type: 'PO Rejection', details: 'Supervisor rejected PO-2026-004 issued by Carlos Dizon. Reason: Incorrect pricing applied on Engine Oil Filter bulk.', dateArchived: 'Jun 13, 2026' }
];

// 2. LocalStorage Initializer
function dbInit() {
    if (!localStorage.getItem('ztg_products')) {
        localStorage.setItem('ztg_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('ztg_employees')) {
        localStorage.setItem('ztg_employees', JSON.stringify(DEFAULT_EMPLOYEES));
    }
    if (!localStorage.getItem('ztg_pending_pos')) {
        localStorage.setItem('ztg_pending_pos', JSON.stringify(DEFAULT_PENDING_POS));
    }
    if (!localStorage.getItem('ztg_transactions')) {
        localStorage.setItem('ztg_transactions', JSON.stringify(DEFAULT_TRANSACTIONS));
    }
    if (!localStorage.getItem('ztg_reservations')) {
        localStorage.setItem('ztg_reservations', JSON.stringify(DEFAULT_RESERVATIONS));
    }
    if (!localStorage.getItem('ztg_archives')) {
        localStorage.setItem('ztg_archives', JSON.stringify(DEFAULT_ARCHIVES));
    }
    if (!localStorage.getItem('ztg_categories')) {
        localStorage.setItem('ztg_categories', JSON.stringify(['Hydraulics', 'Filters', 'Undercarriage', 'Engine', 'Electrical', 'Brake Systems']));
    }
}

dbInit();

// Getters and Setters
const db = {
    getProducts: () => JSON.parse(localStorage.getItem('ztg_products')),
    saveProducts: (p) => localStorage.setItem('ztg_products', JSON.stringify(p)),
    
    getEmployees: () => JSON.parse(localStorage.getItem('ztg_employees')),
    saveEmployees: (e) => localStorage.setItem('ztg_employees', JSON.stringify(e)),
    
    getPendingPOs: () => JSON.parse(localStorage.getItem('ztg_pending_pos')),
    savePendingPOs: (po) => localStorage.setItem('ztg_pending_pos', JSON.stringify(po)),
    
    getTransactions: () => JSON.parse(localStorage.getItem('ztg_transactions')),
    saveTransactions: (t) => localStorage.setItem('ztg_transactions', JSON.stringify(t)),

    getReservations: () => JSON.parse(localStorage.getItem('ztg_reservations')),
    saveReservations: (r) => localStorage.setItem('ztg_reservations', JSON.stringify(r)),

    getArchives: () => JSON.parse(localStorage.getItem('ztg_archives')),
    saveArchives: (a) => localStorage.setItem('ztg_archives', JSON.stringify(a)),
    
    getCategories: () => JSON.parse(localStorage.getItem('ztg_categories')),
    saveCategories: (c) => localStorage.setItem('ztg_categories', JSON.stringify(c))
};

// 3. User & Authentication Logic
function getCurrentUser() {
    const userJson = localStorage.getItem('ztg_current_user');
    if (!userJson) {
        // Fallback default admin
        return { name: 'Administrator', role: 'Admin', id: 'EMP-000' };
    }
    return JSON.parse(userJson);
}

function checkLogin() {
    if (!localStorage.getItem('ztg_current_user') && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// 4. Sidebar Dynamic Renderer
function initSidebar(activePage) {
    const sidebarContainer = document.querySelector('.sidebar');
    if (!sidebarContainer) return;

    const user = getCurrentUser();
    const pendingPOsCount = db.getPendingPOs().length;

    let brandSubtitle = user.role === 'Admin' ? 'Inventory & POS' : 'Cashier View';
    let navItemsHTML = '';

    if (user.role === 'Admin') {
        navItemsHTML = `
            <div class="nav-group">
                <div class="nav-group-label">Main</div>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="index.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                                Dashboard
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="product-management.html" class="nav-link ${activePage === 'products' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                                Product Management
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="inventory.html" class="nav-link ${activePage === 'inventory' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                Inventory
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="pos.html" class="nav-link ${activePage === 'pos' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                Point of Sale (POS)
                            </div>
                            ${pendingPOsCount > 0 ? `<span class="nav-badge">${pendingPOsCount}</span>` : ''}
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="transaction-log.html" class="nav-link ${activePage === 'transactions' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Transaction Log
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="sales-log.html" class="nav-link ${activePage === 'sales-log' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Sales Log
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="reservations.html" class="nav-link ${activePage === 'reservations' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                Order Based
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="nav-group">
                <div class="nav-group-label">Records</div>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="archives.html" class="nav-link ${activePage === 'archives' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                                Archives
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="reports.html" class="nav-link ${activePage === 'reports' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z"/></svg>
                                Reports
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="nav-group">
                <div class="nav-group-label">Config</div>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="settings.html" class="nav-link ${activePage === 'settings' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                Settings
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        `;
    } else {
        navItemsHTML = `
            <div class="nav-group">
                <div class="nav-group-label">Cashier</div>
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="cashier-inventory.html" class="nav-link ${activePage === 'cashier-inventory' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                                Inventory
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="cashier-sales.html" class="nav-link ${activePage === 'cashier-sales' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                My Sales
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="pos.html" class="nav-link ${activePage === 'pos' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                Point of Sale (POS)
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        `;
    }

    sidebarContainer.innerHTML = `
        <div class="sidebar-brand">
            <div class="brand-title">
                <svg style="width:20px;height:20px;stroke:#3B82F6;fill:none;stroke-width:2.5;margin-right:2px;" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ZTG Heavy Parts
            </div>
            <div class="brand-subtitle">${brandSubtitle}</div>
        </div>
        <div class="sidebar-nav">
            ${navItemsHTML}
        </div>
        <div class="sidebar-footer">
            <div class="user-info">
                <div class="user-avatar">${user.name.split(' ').map(n => n[0]).join('')}</div>
                <div class="user-details">
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">${user.role}</div>
                </div>
            </div>
            <a href="#" class="logout-link" onclick="logout(event)">
                <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Sign Out
            </a>
        </div>
    `;
}

function logout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('ztg_current_user');
    window.location.href = 'login.html';
}

// 5. Modal Utils
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// 6. Global Shared Functions (CRUD / Helpers)
function getStockStatus(qty) {
    if (qty === 0) return { text: 'No Stock', class: 'badge-danger' };
    if (qty <= 5) return { text: 'Low Stock', class: 'badge-warning' };
    return { text: 'Active', class: 'badge-success' };
}

// Run basic login validation
checkLogin();
