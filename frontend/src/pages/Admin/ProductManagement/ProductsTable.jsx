import React, { useState, useEffect } from 'react';

export default function ProductsTable({
    products,
    loading,
    categories,
    search, setSearch,
    categoryId, setCategoryId,
    statusFilter, setStatusFilter,
    sortOption, setSortOption,
    DEFAULT_PLACEHOLDER_IMAGE,
    onView, onEdit, onDamage, onDelete, onRestock, onToggleStatus,
    successMessage, setSuccessMessage,
}) {
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const closeAll = () => setOpenDropdownId(null);
        document.addEventListener('click', closeAll);
        return () => document.removeEventListener('click', closeAll);
    }, []);

    // Auto-clear success toast after 3s
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, setSuccessMessage]);

    const renderRow = (product, isVariantSubRow, isFirstInGroup, parentProduct = null) => {
        // Stock level colors
        const alertLevel = product.alert_limit || 5;
        const isOutOfStock = product.stock === 0;
        const isLowStock = product.stock > 0 && product.stock <= alertLevel;

        let stockStatusText = 'Active';
        let statusBg = '#DCFCE7';
        let statusText = '#22C55E';
        let stockColor = '#1F2937';

        if (isOutOfStock) {
            stockStatusText = 'No Stock';
            statusBg = '#FEE2E2';
            statusText = '#EF4444';
            stockColor = '#EF4444';
        } else if (isLowStock) {
            stockStatusText = 'Low Stock';
            statusBg = '#FEF3C7';
            statusText = '#F59E0B';
            stockColor = '#F59E0B';
        }

        let stockBadgeBg = '#F0FDF4';
        if (isOutOfStock) stockBadgeBg = '#FEF2F2';
        else if (isLowStock) stockBadgeBg = '#FEFCE8';

        // Variant options label
        let varLabel = '';
        if (isVariantSubRow) {
            const options = product.variant_options || product.variantOptions;
            if (options && Array.isArray(options)) {
                varLabel = options.map(opt => opt.value).join(', ');
            }
        }

        // Parent categories
        const catName = product.category?.name || parentProduct?.category?.name || 'Unassigned';

        // Check if status is explicitly disabled
        let finalStatusText = product.status || stockStatusText;
        if (product.status === 'Disabled') {
            statusBg = '#F1F5F9';
            statusText = '#64748B';
            finalStatusText = 'Disabled';
        }

        return (
            <tr 
                key={product.id} 
                className="border-b border-slate-100 hover:bg-slate-50/50 transition-all"
                style={isFirstInGroup ? { borderTop: '2px solid #E2E8F0' } : {}}
            >
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="flex items-center gap-3">
                        <img
                            src={product.image || DEFAULT_PLACEHOLDER_IMAGE}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                            onError={(e) => { e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }}
                        />
                        <div className="flex flex-col">
                            {isVariantSubRow ? (
                                <>
                                    <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>
                                        {parentProduct?.name} <span style={{ color: '#3B82F6', fontWeight: '500' }}>({varLabel})</span>
                                    </strong>
                                    {product.chinese_name && <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'block' }}>{product.chinese_name}</span>}
                                </>
                            ) : (
                                <>
                                    <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>{product.name}</strong>
                                    {product.chinese_name && <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'block' }}>{product.chinese_name}</span>}
                                </>
                            )}
                        </div>
                    </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#334155', fontWeight: '600', fontSize: '12px' }}>{product.part_no}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#334155', fontSize: '12px' }}>{catName}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569', fontSize: '12px' }}>{product.address || '—'}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2', padding: '4px 8px', borderRadius: '6px', backgroundColor: stockBadgeBg, color: stockColor, minWidth: '50px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{product.stock}</span>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Units</span>
                    </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#334155', fontWeight: '500', fontSize: '12px' }}>₱{Number(product.price1).toLocaleString('en-US')}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', fontWeight: '500', fontSize: '12px', color: '#2563EB' }}>₱{Number(product.price2).toLocaleString('en-US')}</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>{product.sales_count || 0} sold</td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span 
                            style={{ 
                                backgroundColor: statusBg, 
                                color: statusText, 
                                padding: '4px 10px', 
                                borderRadius: '9999px', 
                                fontSize: '11px', 
                                fontWeight: '600',
                                display: 'inline-block'
                            }}
                        >
                            {finalStatusText}
                        </span>
                        {product.is_dead_stock && (
                            <span 
                                style={{ 
                                    backgroundColor: '#FEE2E2', 
                                    color: '#DC2626', 
                                    padding: '4px 10px', 
                                    borderRadius: '9999px', 
                                    fontSize: '11px', 
                                    fontWeight: '600',
                                    display: 'inline-block'
                                }}
                            >
                                Dead Stock
                            </span>
                        )}
                    </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#FEF2F2', color: '#EF4444', minWidth: '60px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700' }}>{product.damaged || 0}</span>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Damaged</span>
                    </div>
                </td>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-1.5" style={{ position: 'relative' }}>
                        {/* Inline View Button */}
                        <button 
                            onClick={() => onView(product)} 
                            className="action-trigger-btn" 
                            aria-label="View Product Details" 
                            data-tooltip="View Details"
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>

                        {/* Three-dot Overflow Menu */}
                        <div className="actions-dropdown-container">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(openDropdownId === product.id ? null : product.id);
                                }} 
                                className="action-trigger-btn" 
                                aria-label="More actions" 
                                aria-haspopup="true" 
                                aria-expanded={openDropdownId === product.id ? "true" : "false"} 
                                data-tooltip="More actions"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <circle cx="12" cy="5" r="2"></circle>
                                    <circle cx="12" cy="12" r="2"></circle>
                                    <circle cx="12" cy="19" r="2"></circle>
                                </svg>
                            </button>
                            <div className={`actions-dropdown-menu ${openDropdownId === product.id ? 'show' : ''}`} role="menu">
                                <button 
                                    onClick={() => {
                                        setOpenDropdownId(null);
                                        onEdit(product);
                                    }} 
                                    className="actions-dropdown-item" 
                                    role="menuitem"
                                >
                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    Edit Product
                                </button>
                                        <div className="actions-dropdown-divider" style={{ margin: '4px 0', borderTop: '1px solid #E2E8F0' }}></div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDropdownId(null);
                                                onToggleStatus(product);
                                            }} 
                                            className={`actions-dropdown-item ${product.status === 'Disabled' ? 'enable' : 'disable'}`} 
                                            role="menuitem"
                                            style={{ color: product.status === 'Disabled' ? '#10B981' : '#EF4444' }}
                                        >
                                            {product.status === 'Disabled' ? (
                                                <>
                                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Enable Product
                                                </>
                                            ) : (
                                                <>
                                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> Disable Product
                                                </>
                                            )}
                                        </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <>
            {/* Success Toast (Reference Style) */}
            {successMessage && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999,
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#10B981', color: 'white',
                    padding: '12px 20px', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '14px', fontWeight: 500, pointerEvents: 'auto',
                    animation: 'toast-slide-up 0.3s ease-out forwards'
                }}>
                    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ marginBottom: '16px' }}>
                <div className="table-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by part number or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <select className="form-control" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div style={{ width: '140px' }}>
                        <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="No Stock">No Stock</option>
                            <option value="Disabled">Disabled</option>
                            <option value="Dead Stock">Dead Stock</option>
                        </select>
                    </div>
                    <div style={{ width: '140px' }}>
                        <select className="form-control" value={sortOption || 'Default'} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="Default">Sort: Default</option>
                            <option value="Name: A-Z">Name (A-Z)</option>
                            <option value="Sales">Top Sales</option>
                            <option value="Damaged">Most Damaged</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card table-card" style={{ overflow: 'visible', paddingBottom: '120px' }}>
                <div style={{ overflowX: 'visible' }}>
                    <table>
                        <thead style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Part No.</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Address</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Stock</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Original Price</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Retail Price</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Sales</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Damaged</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="11" className="py-8 text-center text-xs font-semibold text-slate-400">Loading catalog items...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="11" className="py-8 text-center text-xs font-semibold text-slate-400">No products found matching criteria.</td></tr>
                            ) : (
                                products.map((p, parentIndex) => {
                                    const rows = [];
                                    // 1. Parent product row
                                    rows.push(renderRow(p, false, parentIndex > 0));

                                    // 2. Child variant rows
                                    if (p.variants && p.variants.length > 0) {
                                        p.variants.forEach((v) => {
                                            rows.push(renderRow(v, true, false, p));
                                        });
                                    }

                                    return rows;
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
