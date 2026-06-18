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

// Helper to notify local and remote tabs of database updates
function notifyDbChange(key) {
    try {
        const storageEvent = new StorageEvent('storage', {
            key: key,
            newValue: localStorage.getItem(key)
        });
        window.dispatchEvent(storageEvent);
    } catch (e) {
        console.error('Error dispatching local storage event', e);
    }
}

// Wrap save methods to auto-trigger sync and local updates
const dbKeys = {
    saveProducts: 'ztg_products',
    saveEmployees: 'ztg_employees',
    savePendingPOs: 'ztg_pending_pos',
    saveTransactions: 'ztg_transactions',
    saveReservations: 'ztg_reservations',
    saveArchives: 'ztg_archives',
    saveCategories: 'ztg_categories'
};

Object.keys(dbKeys).forEach(methodName => {
    const originalMethod = db[methodName];
    if (originalMethod) {
        db[methodName] = function(data) {
            originalMethod(data);
            notifyDbChange(dbKeys[methodName]);
        };
    }
});

// Global cross-tab storage event listener for real-time prototype syncing
window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('ztg_')) {
        // Trigger notification updates
        if (typeof window.triggerNotificationsUpdate === 'function') {
            window.triggerNotificationsUpdate();
        }
        
        // Dynamically invoke render routines of the active tab view if defined
        if (typeof renderReservations === 'function') {
            renderReservations();
        }
        if (typeof renderTransactions === 'function') {
            renderTransactions();
        }
        if (typeof renderProductsTable === 'function') {
            renderProductsTable();
        }
        if (typeof renderInventoryTable === 'function') {
            renderInventoryTable();
        }
        if (typeof renderSalesTable === 'function') {
            renderSalesTable();
        }
        if (typeof renderMySales === 'function') {
            renderMySales();
        }
        if (typeof renderPOSProducts === 'function') {
            renderPOSProducts();
        }
        if (typeof renderArchives === 'function') {
            renderArchives();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
    }
});

// 3. User & Authentication Logic
function getCurrentUser() {
    const userJson = sessionStorage.getItem('ztg_current_user');
    if (!userJson) {
        // Fallback default admin
        return { name: 'Administrator', role: 'Admin', id: 'EMP-000' };
    }
    return JSON.parse(userJson);
}

function checkLogin() {
    const isLoginPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
    const userJson = sessionStorage.getItem('ztg_current_user');

    if (!userJson) {
        if (!isLoginPage) {
            window.location.href = 'index.html';
        }
    } else {
        if (isLoginPage) {
            const user = JSON.parse(userJson);
            window.location.href = user.role === 'Admin' ? 'dashboard.html' : 'pos.html';
        }
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
                        <a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
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
                        <a href="pos.html" class="nav-link ${activePage === 'pos' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                Point of Sale (POS)
                            </div>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="daily-sales.html" class="nav-link ${activePage === 'daily-sales' || activePage === 'cashier-sales' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                Daily Sales
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
                    <li class="nav-item">
                        <a href="customer-log.html" class="nav-link ${activePage === 'customer-log' ? 'active' : ''}">
                            <div class="nav-link-content">
                                <svg><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                Customer Log
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
    if (window.initNotifications) window.initNotifications();
}

function logout(event) {
    if (event) event.preventDefault();
    sessionStorage.removeItem('ztg_current_user');
    navigateTo('index.html');
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

// 7. SPA Router & Framed Transition Implementation
let pageListeners = [];
let pageTimers = [];
let pageIntervals = [];
let pageRestorers = [];
let trackListeners = false;
let isPageLoading = false;

// Global overrides for tracking listeners and timers
const originalWindowAdd = window.addEventListener;
const originalDocumentAdd = document.addEventListener;
const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;

window.addEventListener = function(type, listener, options) {
    if (trackListeners) {
        pageListeners.push({ target: window, type, listener, options });
    }
    return originalWindowAdd.call(window, type, listener, options);
};

document.addEventListener = function(type, listener, options) {
    if (trackListeners) {
        pageListeners.push({ target: document, type, listener, options });
    }
    return originalDocumentAdd.call(document, type, listener, options);
};

window.setTimeout = function(handler, timeout, ...args) {
    const id = originalSetTimeout.call(window, handler, timeout, ...args);
    if (trackListeners) {
        pageTimers.push(id);
    }
    return id;
};

window.setInterval = function(handler, timeout, ...args) {
    const id = originalSetInterval.call(window, handler, timeout, ...args);
    if (trackListeners) {
        pageIntervals.push(id);
    }
    return id;
};

const sleep = ms => new Promise(res => originalSetTimeout(res, ms));

function unloadCurrentPage() {
    // 1. Remove tracked event listeners
    pageListeners.forEach(({ target, type, listener, options }) => {
        try {
            target.removeEventListener(type, listener, options);
        } catch (e) {
            console.error('Error removing listener:', e);
        }
    });
    pageListeners = [];

    // 2. Clear tracked timers and intervals
    pageTimers.forEach(id => clearTimeout(id));
    pageTimers = [];
    pageIntervals.forEach(id => clearInterval(id));
    pageIntervals = [];

    // 3. Run window property restorers
    pageRestorers.forEach(restore => {
        try {
            restore();
        } catch (e) {
            console.error('Error running restorer:', e);
        }
    });
    pageRestorers = [];

    // 4. Remove subpage modals
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());

    // 5. Remove page-specific style tags
    document.querySelectorAll('[data-spa-style="true"]').forEach(el => el.remove());
}

async function navigateTo(url, push = true) {
    if (isPageLoading) return;
    
    // Fallback if CORS prevents fetch or using file:// protocol
    if (window.location.protocol === 'file:') {
        window.location.href = url;
        return;
    }
    
    isPageLoading = true;
    
    try {
        const responsePromise = fetch(url).then(res => {
            if (!res.ok) throw new Error('Failed to fetch page');
            return res.text();
        });
        
        const html = await responsePromise;
        const parser = new DOMParser();
        const parsedDoc = parser.parseFromString(html, 'text/html');
        
        const hasCurrentWorkspace = !!document.querySelector('.main-workspace');
        const hasNewWorkspace = !!parsedDoc.querySelector('.main-workspace');
        const isCurrentLogin = document.body.classList.contains('login-body');
        const isNewLogin = parsedDoc.body.classList.contains('login-body');
        
        const fullBodySwap = !hasCurrentWorkspace || !hasNewWorkspace || (isCurrentLogin !== isNewLogin);
        
        // Trigger fade out
        if (fullBodySwap) {
            document.body.classList.add('body-fade-out');
        } else {
            const currentWorkspace = document.querySelector('.main-workspace');
            if (currentWorkspace) {
                currentWorkspace.classList.add('fade-out');
            }
        }
        
        // Wait at least 220ms for transition fade-out to complete
        await sleep(220);

        if (push) {
            history.pushState({ url }, '', url);
        }

        // Perform DOM swap and execute scripts
        unloadCurrentPage();

        // 1. Update title
        const newTitle = parsedDoc.querySelector('title');
        if (newTitle) {
            document.title = newTitle.innerText;
        }

        // 2. Inject Page Styles
        const pageStyles = parsedDoc.querySelectorAll('style');
        pageStyles.forEach(style => {
            const clonedStyle = style.cloneNode(true);
            clonedStyle.setAttribute('data-spa-style', 'true');
            document.head.appendChild(clonedStyle);
        });

        if (fullBodySwap) {
            // 3a. Swap entire body
            document.body.className = parsedDoc.body.className;
            document.body.innerHTML = parsedDoc.body.innerHTML;
            
            // Add fade-out state, then trigger fade-in transition
            document.body.classList.add('body-fade-out');
            document.body.offsetHeight; // trigger reflow
            document.body.classList.remove('body-fade-out');
        } else {
            // 3b. Swap only the workspace
            const currentWorkspace = document.querySelector('.main-workspace');
            const newWorkspace = parsedDoc.querySelector('.main-workspace');
            if (currentWorkspace && newWorkspace) {
                newWorkspace.classList.add('fade-in');
                currentWorkspace.replaceWith(newWorkspace);
                
                // Trigger reflow
                newWorkspace.offsetHeight;
                newWorkspace.classList.remove('fade-in');
            }
        }

        // 4. Append Modal Overlays
        const newModals = parsedDoc.querySelectorAll('.modal-overlay');
        newModals.forEach(modal => {
            document.body.appendChild(modal);
        });

        // 5. Run page scripts
        const inlineScripts = parsedDoc.querySelectorAll('script:not([src])');
        inlineScripts.forEach(script => {
            executeSubpageScript(script.textContent);
        });

    } catch (e) {
        console.error('SPA navigation failed, falling back to full reload:', e);
        window.location.href = url;
    } finally {
        isPageLoading = false;
    }
}

function executeSubpageScript(scriptText) {
    // Extract top-level function declarations
    const functionRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_$]+)\s*\(/g;
    let match;
    const functionsToBind = [];
    while ((match = functionRegex.exec(scriptText)) !== null) {
        functionsToBind.push(match[1]);
    }

    // Create a localWindow proxy for the execution context
    const originalWindowProperties = {};
    const localWindow = new Proxy(window, {
        get(target, prop) {
            if (prop === 'window' || prop === 'self' || prop === 'globalThis') {
                return localWindow;
            }
            const val = target[prop];
            return typeof val === 'function' ? val.bind(target) : val;
        },
        set(target, prop, value) {
            if (!(prop in originalWindowProperties)) {
                originalWindowProperties[prop] = prop in target ? target[prop] : undefined;
            }
            target[prop] = value;
            return true;
        }
    });

    // Expose local functions to window so inline event handlers can call them
    let exposeScript = '';
    functionsToBind.forEach(func => {
        exposeScript += `\nwindow.${func} = ${func};`;
    });

    // Add restorer function to global restorers array
    pageRestorers.push(() => {
        for (const prop in originalWindowProperties) {
            const originalValue = originalWindowProperties[prop];
            if (originalValue === undefined) {
                try {
                    delete window[prop];
                } catch (e) {
                    window[prop] = undefined;
                }
            } else {
                window[prop] = originalValue;
            }
        }
    });

    try {
        // Run with localWindow parameter shadowing the global window variable
        const runner = new Function('window', scriptText + exposeScript);
        runner(localWindow);
    } catch (err) {
        console.error('Error executing subpage script:', err);
    }
}

// Intercept all clicks on internal links
originalWindowAdd.call(window, 'click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.target === '_blank') return;
    
    // Check if it's internal link
    try {
        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;
        
        // Skip if clicking active/current page to avoid double loading
        const currentUrl = new URL(window.location.href);
        if (currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        navigateTo(href);
    } catch (err) {
        // Safe fallback
    }
});

// Intercept history back/forward navigation
originalWindowAdd.call(window, 'popstate', (e) => {
    navigateTo(window.location.href, false);
});

// Mark existing inline style tags as SPA styles so they can be cleaned up on transition
document.querySelectorAll('head style').forEach(style => {
    style.setAttribute('data-spa-style', 'true');
});

// Start tracking page listeners after app.js completes initialization
trackListeners = true;

// ==========================================
// NOTIFICATIONS SYSTEM
// ==========================================

let audioCtx = null;
window.playChime = function() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const ctx = audioCtx;
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(783.99, ctx.currentTime);
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.12);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start();
        osc1.stop(ctx.currentTime + 0.7);
        osc2.start(ctx.currentTime + 0.12);
        osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {
        console.warn('Audio play blocked or unsupported', e);
    }
};

window.showToast = function(n) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'notif-toast';
    toast.style.pointerEvents = 'auto';
    
    let iconBg = '#EFF6FF';
    let iconColor = '#3B82F6';
    let iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
    
    if (n.type === 'low_stock') {
        iconBg = '#FEF2F2';
        iconColor = '#EF4444';
        iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else if (n.type === 'insight') {
        iconBg = '#ECFDF5';
        iconColor = '#10B981';
        iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
    }
    
    toast.innerHTML = `
        <div class="notif-toast-icon" style="background: ${iconBg}; color: ${iconColor};">
            ${iconSvg}
        </div>
        <div class="notif-toast-content">
            <div class="notif-toast-title">${n.title}</div>
            <div class="notif-toast-msg">${n.message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    toast.addEventListener('click', () => {
        window.markAsRead(n.id);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
        // Resolve destination based on CURRENT user role at click time
        const toastUser = getCurrentUser();
        const toastRole = toastUser ? toastUser.role : 'Admin';
        let dest = null;
        if (n.type === 'transaction') {
            dest = toastRole === 'Admin' ? 'transaction-log.html' : 'daily-sales.html';
        } else if (n.type === 'low_stock') {
            dest = toastRole === 'Admin' ? 'product-management.html' : 'pos.html';
        } else if (n.type === 'insight') {
            dest = 'reports.html';
        } else if (n.link) {
            dest = n.link;
        }
        if (dest) navigateTo(dest);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }
    }, 5000);
};

window.updateNotificationsFromDB = function() {
    const products = db.getProducts() || [];
    const pendingPOs = db.getPendingPOs() || [];
    const transactions = db.getTransactions() || [];
    const currentUser = getCurrentUser();
    const role = currentUser ? currentUser.role : 'Admin';
    
    let notifications = JSON.parse(localStorage.getItem('ztg_notifications') || '[]');
    let changed = false;
    
    // 1. Process Low Stock Notifications
    const lowStockProductIds = new Set();
    products.forEach(p => {
        if (p.stock <= 5) {
            lowStockProductIds.add(p.id);
            const hasNotif = notifications.some(n => n.type === 'low_stock' && n.productId === p.id);
            if (!hasNotif) {
                notifications.unshift({
                    id: 'notif-stock-' + p.id,
                    type: 'low_stock',
                    productId: p.id,
                    title: p.stock === 0 ? 'Out of Stock' : 'Low Stock Alert',
                    message: `${p.name} (${p.partNo || 'N/A'}) has only ${p.stock} units left!`,
                    timestamp: Date.now(),
                    read: false
                    // link resolved at click time based on current user role
                });
                changed = true;
            }
        }
    });
    const initialLength = notifications.length;
    notifications = notifications.filter(n => {
        if (n.type === 'low_stock') {
            return lowStockProductIds.has(n.productId);
        }
        return true;
    });
    if (notifications.length !== initialLength) {
        changed = true;
    }
    
    // 2. Process Completed Transactions (Real-time notifications for Admin and Cashier)
    const completedTxIds = new Set(transactions.map(t => t.siNo || t.id));
    transactions.forEach(t => {
        const txId = t.siNo || t.id;
        const hasNotif = notifications.some(n => n.type === 'transaction' && n.txId === txId);
        if (!hasNotif) {
            const title = role === 'Admin' ? 'New Completed Sale' : 'Transaction Completed';
            const message = role === 'Admin' 
                ? `${t.cashier} processed sale ${txId} for ${t.customer} (₱${t.amount.toLocaleString()}).`
                : `Sale ${txId} was processed successfully (₱${t.amount.toLocaleString()}).`;
            
            notifications.unshift({
                id: 'notif-tx-' + txId,
                type: 'transaction',
                txId: txId,
                title: title,
                message: message,
                timestamp: Date.now(),
                read: false
                // link resolved at click time based on current user role
            });
            changed = true;
        }
    });
    const initialLength2 = notifications.length;
    notifications = notifications.filter(n => {
        if (n.type === 'transaction') {
            return completedTxIds.has(n.txId);
        }
        return true;
    });
    if (notifications.length !== initialLength2) {
        changed = true;
    }
    
    // 3. Process Insights (Fast Moving Items)
    const salesCounts = {};
    transactions.forEach(t => {
        if (t.status === 'Completed' || t.status === 'Closed') {
            salesCounts[t.itemName] = (salesCounts[t.itemName] || 0) + (t.qty || 1);
        }
    });
    Object.keys(salesCounts).forEach(itemName => {
        const qtySold = salesCounts[itemName];
        if (qtySold >= 8) {
            const hasNotif = notifications.some(n => n.type === 'insight' && n.itemName === itemName);
            if (!hasNotif) {
                notifications.unshift({
                    id: 'notif-insight-' + itemName.replace(/\s+/g, '-'),
                    type: 'insight',
                    itemName: itemName,
                    title: 'Fast-Moving Item Insight',
                    message: `${itemName} is fast-moving! Total ${qtySold} units sold recently.`,
                    timestamp: Date.now(),
                    read: false,
                    link: 'reports.html'
                });
                changed = true;
            }
        }
    });
    
    if (changed || !localStorage.getItem('ztg_notifications')) {
        localStorage.setItem('ztg_notifications', JSON.stringify(notifications));
    }
    
    return notifications;
};

window.markAsRead = function(id) {
    let notifications = JSON.parse(localStorage.getItem('ztg_notifications') || '[]');
    notifications = notifications.map(n => {
        if (n.id === id) n.read = true;
        return n;
    });
    localStorage.setItem('ztg_notifications', JSON.stringify(notifications));
    window.renderNotificationsUI(notifications);
};

window.markAllAsRead = function() {
    let notifications = JSON.parse(localStorage.getItem('ztg_notifications') || '[]');
    notifications = notifications.map(n => {
        n.read = true;
        return n;
    });
    localStorage.setItem('ztg_notifications', JSON.stringify(notifications));
    window.renderNotificationsUI(notifications);
};

window.renderNotificationsUI = function(notifications) {
    const badge = document.getElementById('notifBadge');
    const container = document.getElementById('notifItemsContainer');
    const emptyFooter = document.getElementById('notifEmptyFooter');
    
    if (!badge || !container) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = 'flex';
        badge.classList.add('pulse');
    } else {
        badge.style.display = 'none';
        badge.classList.remove('pulse');
    }
    
    container.innerHTML = '';
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 32px 16px; color: var(--text-secondary);">
                <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 1.5; margin-bottom: 8px; opacity: 0.5; display: block; margin-left: auto; margin-right: auto;">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <div style="font-size: 13px; font-weight: 600;">All caught up!</div>
                <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">No notifications at this time.</div>
            </div>
        `;
        if (emptyFooter) emptyFooter.style.display = 'none';
        return;
    }
    
    if (emptyFooter) emptyFooter.style.display = 'block';
    
    notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item' + (n.read ? '' : ' unread');
        item.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border, #E2E8F0);
            cursor: pointer;
            transition: background-color 0.2s;
            position: relative;
            background: ${n.read ? '#FFFFFF' : 'rgba(59, 130, 246, 0.03)'};
        `;
        
        let iconBg = '#EFF6FF';
        let iconColor = '#3B82F6';
        let iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`;
        
        if (n.type === 'low_stock') {
            iconBg = '#FEF2F2';
            iconColor = '#EF4444';
            iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        } else if (n.type === 'insight') {
            iconBg = '#ECFDF5';
            iconColor = '#10B981';
            iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
        } else if (n.type === 'transaction') {
            iconBg = '#F0FDF4';
            iconColor = '#16A34A';
            iconSvg = `<svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2;"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
        }
        
        const timeDiff = Date.now() - n.timestamp;
        let timeStr = 'Just now';
        if (timeDiff > 60000) {
            const mins = Math.floor(timeDiff / 60000);
            if (mins < 60) {
                timeStr = `${mins}m ago`;
            } else {
                const hours = Math.floor(mins / 60);
                if (hours < 24) {
                    timeStr = `${hours}h ago`;
                } else {
                    timeStr = new Date(n.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
                }
            }
        }
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${iconBg}; color: ${iconColor}; border-radius: 8px; flex-shrink: 0;">
                ${iconSvg}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 4px; margin-bottom: 2px;">
                    <strong style="font-size: 13px; font-weight: 700; color: var(--text-primary, #0F172A); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${n.title}</strong>
                    <span style="font-size: 10px; color: var(--text-secondary, #64748B); flex-shrink: 0;">${timeStr}</span>
                </div>
                <div style="font-size: 11px; color: var(--text-secondary, #64748B); line-height: 1.4; word-break: break-word;">${n.message}</div>
            </div>
            ${n.read ? '' : '<div class="unread-dot" style="width: 6px; height: 6px; background: #3B82F6; border-radius: 50%; align-self: center; flex-shrink: 0; margin-left: 8px;"></div>'}
        `;
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            window.markAsRead(n.id);
            const dropdown = document.getElementById('notifDropdown');
            if (dropdown) dropdown.style.display = 'none';
            // Resolve destination based on CURRENT user role at click time
            const clickUser = getCurrentUser();
            const clickRole = clickUser ? clickUser.role : 'Admin';
            let dest = null;
            if (n.type === 'transaction') {
                dest = clickRole === 'Admin' ? 'transaction-log.html' : 'daily-sales.html';
            } else if (n.type === 'low_stock') {
                dest = clickRole === 'Admin' ? 'product-management.html' : 'pos.html';
            } else if (n.type === 'insight') {
                dest = 'reports.html';
            } else if (n.link) {
                dest = n.link;
            }
            if (dest) navigateTo(dest);
        });
        
        container.appendChild(item);
    });
};

window.triggerNotificationsUpdate = function() {
    const notifications = window.updateNotificationsFromDB();
    
    // Check for newly added unread notifications to trigger toast/chime
    const notifiedIds = new Set(JSON.parse(localStorage.getItem('ztg_notified_ids') || '[]'));
    let hasNew = false;
    
    notifications.forEach(n => {
        if (!n.read && !notifiedIds.has(n.id)) {
            if (window.isNotificationsLoaded) {
                window.showToast(n);
                hasNew = true;
            }
            notifiedIds.add(n.id);
        }
    });
    
    if (hasNew) {
        window.playChime();
    }
    
    localStorage.setItem('ztg_notified_ids', JSON.stringify(Array.from(notifiedIds)));
    window.renderNotificationsUI(notifications);
};

window.initNotifications = function() {
    const topBar = document.querySelector('.top-bar');
    if (!topBar) return;
    
    topBar.style.position = 'relative';
    
    // Remove any existing notification bell first to prevent duplicate renderings on SPA transition
    const existingNotif = topBar.querySelector('.notif-wrapper');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    let actionsContainer = topBar.querySelector('.top-bar-actions');
    const isPOS = window.location.pathname.includes('pos.html');
    
    // Create notifications container
    const wrapper = document.createElement('div');
    wrapper.className = 'notif-wrapper';
    
    wrapper.innerHTML = `
        <button class="notif-btn" id="notifBellBtn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" style="width: 22px; height: 22px; fill: none; stroke: var(--text-secondary, #64748B); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notif-badge" id="notifBadge">0</span>
        </button>
        
        <div class="notif-dropdown" id="notifDropdown">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border, #E2E8F0); background: #F8FAFC;">
                <span style="font-weight: 700; font-size: 14px; color: var(--text-primary, #0F172A);">Notifications</span>
                <button id="notifMarkAllRead" style="background: none; border: none; color: var(--primary, #3B82F6); font-size: 12px; font-weight: 600; cursor: pointer; padding: 0;">Mark all as read</button>
            </div>
            <div id="notifItemsContainer" style="max-height: 320px; overflow-y: auto;"></div>
            <div id="notifEmptyFooter" style="text-align: center; padding: 12px; border-top: 1px solid var(--border, #E2E8F0); background: #F8FAFC; display:none;">
                <span style="font-size: 11px; color: var(--text-secondary, #64748B);">Notifications Synced</span>
            </div>
        </div>
    `;
    
    if (isPOS) {
        // Position absolutely on pos.html to avoid tab bar layout break
        wrapper.style.position = 'absolute';
        wrapper.style.top = '12px';
        wrapper.style.right = '24px';
        topBar.appendChild(wrapper);
    } else if (actionsContainer) {
        actionsContainer.style.display = 'flex';
        actionsContainer.style.alignItems = 'center';
        actionsContainer.style.gap = '16px';
        actionsContainer.appendChild(wrapper);
    } else {
        // Create an actions container on the fly for other pages
        actionsContainer = document.createElement('div');
        actionsContainer.className = 'top-bar-actions';
        actionsContainer.style.display = 'flex';
        actionsContainer.style.alignItems = 'center';
        actionsContainer.style.gap = '16px';
        
        const children = Array.from(topBar.children);
        children.forEach(child => {
            const isTitle = child.querySelector('h1') || child.classList.contains('top-bar-title') || child.querySelector('.top-bar-title') || child.tagName === 'H1';
            if (!isTitle && child !== topBar.firstElementChild) {
                actionsContainer.appendChild(child);
            }
        });
        
        actionsContainer.appendChild(wrapper);
        topBar.appendChild(actionsContainer);
    }
    
    // Toggle dropdown
    const bellBtn = wrapper.querySelector('#notifBellBtn');
    const dropdown = wrapper.querySelector('#notifDropdown');
    const markAllBtn = wrapper.querySelector('#notifMarkAllRead');
    
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Toggle
        const isShown = dropdown.style.display === 'block';
        dropdown.style.display = isShown ? 'none' : 'block';
        
        // Resume AudioContext context on interaction to allow chime play
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    });
    
    markAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.markAllAsRead();
    });
    
    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Perform initial notifications render
    const notifications = window.updateNotificationsFromDB();
    
    // Populate notifiedIds if not present to avoid chime blast on load
    const notifiedIds = new Set(JSON.parse(localStorage.getItem('ztg_notified_ids') || '[]'));
    let notifiedChanged = false;
    notifications.forEach(n => {
        if (!notifiedIds.has(n.id)) {
            notifiedIds.add(n.id);
            notifiedChanged = true;
        }
    });
    if (notifiedChanged) {
        localStorage.setItem('ztg_notified_ids', JSON.stringify(Array.from(notifiedIds)));
    }
    
    window.renderNotificationsUI(notifications);
    window.isNotificationsLoaded = true;
};

// Cross-tab notification sync listener (localStorage storage event — works across tabs in same browser)
window.addEventListener('storage', (e) => {
    if (e.key === 'ztg_pending_pos' || e.key === 'ztg_products' || e.key === 'ztg_transactions' || e.key === 'ztg_notifications' || e.key === 'ztg_reservations') {
        if (window.triggerNotificationsUpdate) window.triggerNotificationsUpdate();
        // Refresh transaction log table if on that page
        if (typeof window.renderTransactions === 'function') window.renderTransactions();
        // Refresh reservations table if on that page
        if (typeof window.renderReservations === 'function') window.renderReservations();
        // Refresh sales log if on that page
        if (typeof window.renderSalesLog === 'function') window.renderSalesLog();
    }
});

// ==========================================
// REAL-TIME BROADCAST CHANNEL SYNC
// ==========================================
// BroadcastChannel provides real-time messaging between tabs on the same origin.
// This works in production (Vercel) because tabs share the same origin.
// Falls back to setInterval polling for browsers that don't support BroadcastChannel.

(function setupRealTimeSync() {
    const CHANNEL_NAME = 'ztg_sync';
    let bc = null;

    // Try to set up BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
        try {
            bc = new BroadcastChannel(CHANNEL_NAME);

            // Listen for messages from other tabs
            bc.onmessage = function(event) {
                const data = event.data || {};
                if (data.type === 'data_changed') {
                    // Re-run notifications update (updates badge + stores in localStorage)
                    if (window.triggerNotificationsUpdate) window.triggerNotificationsUpdate();
                    // Refresh live tables if present on the current page
                    if (typeof window.renderTransactions === 'function') window.renderTransactions();
                    if (typeof window.renderReservations === 'function') window.renderReservations();
                    if (typeof window.renderSalesLog === 'function') window.renderSalesLog();
                    if (typeof window.renderDashboard === 'function') window.renderDashboard();
                }
            };

            // Patch db save methods to also broadcast changes
            const keysToWatch = ['saveTransactions', 'saveProducts', 'savePendingPOs', 'saveReservations'];
            keysToWatch.forEach(method => {
                const original = db[method];
                db[method] = function(...args) {
                    original.apply(db, args);
                    try { bc.postMessage({ type: 'data_changed', method }); } catch(e) {}
                };
            });
        } catch(e) {
            console.warn('BroadcastChannel setup failed:', e);
        }
    }

    // POLLING FALLBACK: Check for new transactions every 3s regardless of BroadcastChannel.
    // This ensures the transaction log & notification badge refresh even without cross-tab events.
    let lastTxCount = (db.getTransactions() || []).length;
    let lastResCound = (db.getReservations() || []).length;

    setInterval(function() {
        const txs = db.getTransactions() || [];
        const ress = db.getReservations() || [];
        const newTxCount = txs.length;
        const newResCount = ress.length;

        if (newTxCount !== lastTxCount || newResCount !== lastResCound) {
            lastTxCount = newTxCount;
            lastResCound = newResCount;
            if (window.triggerNotificationsUpdate) window.triggerNotificationsUpdate();
            if (typeof window.renderTransactions === 'function') window.renderTransactions();
            if (typeof window.renderReservations === 'function') window.renderReservations();
            if (typeof window.renderSalesLog === 'function') window.renderSalesLog();
        }
    }, 3000);
})();

