import React from 'react';
import { useInventory } from './hooks/useInventory';

import InventoryTable from './views/InventoryTable';
import ViewProductModal from './modals/ViewProductModal';

export default function Inventory() {
    const {
        products,
        categories,
        loading,
        search, setSearch,
        categoryId, setCategoryId,
        statusFilter, setStatusFilter,
        selectedProduct, setSelectedProduct,
        showViewModal, setShowViewModal,
        handleViewProduct,
        totalItems,
        categoriesCount,
        outOfStockCount,
        lowStockCount,
        dateFilter, setDateFilter
    } = useInventory();

    return (
        <>

                <div className="top-bar">
                    <div>
                        <h1 style={{ fontSize: '20px', marginBottom: '2px' }}>Inventory Management</h1>
                        <div className="page-description" style={{ marginTop: 0, fontSize: '12px' }}>
                            {totalItems} total items across {categoriesCount} categories · {outOfStockCount} out of stock · {lowStockCount} low stock
                        </div>
                    </div>
                    <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-success" style={{ fontSize: '11px', padding: '6px 12px' }}>Read-Only View</span>                    </div>
                </div>

                <div className="content-body">

                    <div className="card" style={{ marginBottom: '16px' }}>
                        <div className="table-filters">
                            <div className="table-search" style={{ flex: 1, maxWidth: '100%' }}>
                                <svg viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                <input
                                    type="text"
                                    placeholder="Search product description, part number, category, or address..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <select className="table-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <select className="table-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">All Stock Levels</option>
                                <option value="Active">Active / Healthy</option>
                                <option value="Low Stock">Low Stock</option>
                                <option value="No Stock">No Stock</option>
                                <option value="Dead Stock">Dead Stock</option>
                            </select>
                            <select className="table-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                                <option value="today">Sold Today</option>
                                <option value="this_week">Sold This Week</option>
                                <option value="this_month">Sold This Month</option>
                                <option value="this_year">Sold This Year</option>
                            </select>
                        </div>
                    </div>

                    <InventoryTable 
                        products={products}
                        loading={loading}
                        handleViewProduct={handleViewProduct}
                    />

                </div>

            <ViewProductModal 
                showViewModal={showViewModal} setShowViewModal={setShowViewModal}
                selectedProduct={selectedProduct}
            />
        </>
    );
}
