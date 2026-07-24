import React, { useState, useEffect } from 'react';
import IOSSelect from '../../../shared/components/IOSSelect';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import useDisplayChineseNames from '../../../shared/hooks/useDisplayChineseNames';

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
    pagination,
}) {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const showChineseNames = useDisplayChineseNames();

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
                                        {product.name || parentProduct?.name} {varLabel && !(product.name || '').includes(varLabel) && <span style={{ color: '#3B82F6', fontWeight: '500' }}>({varLabel})</span>}
                                    </strong>
                                    {showChineseNames && product.chinese_name && <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'block' }}>{product.chinese_name}</span>}
                                </>
                            ) : (
                                <>
                                    <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>{product.name}</strong>
                                    {showChineseNames && product.chinese_name && <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'block' }}>{product.chinese_name}</span>}
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
                <div className="table-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                            type="text"
                            className="form-control table-search-input"
                            placeholder="Search by part number or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '44px' }}
                        />
                    </div>
                    <div style={{ width: '180px' }}>
                        <IOSSelect
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <IOSSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'All Status' },
                                { value: 'Active', label: 'Active' },
                                { value: 'Low Stock', label: 'Low Stock' },
                                { value: 'No Stock', label: 'No Stock' },
                                { value: 'Disabled', label: 'Disabled' },
                                { value: 'Dead Stock', label: 'Dead Stock' }
                            ]}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <IOSSelect
                            value={sortOption || 'Default'}
                            onChange={(e) => setSortOption(e.target.value)}
                            options={[
                                { value: 'Default', label: 'Sort: Default' },
                                { value: 'Name: A-Z', label: 'Name (A-Z)' },
                                { value: 'Sales', label: 'Top Sales' },
                                { value: 'Damaged', label: 'Most Damaged' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="card table-card" style={{ overflow: 'visible', paddingBottom: '120px' }}>
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ minWidth: '780px', width: '100%' }}>
                        <thead style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Part No.</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Category</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Address</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Stock</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Original Price</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Retail Price</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" style={{ padding: '32px' }}><LoadingSpinner text="Loading catalog items..." minHeight="100px" /></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="9" className="py-8 text-center text-xs font-semibold text-slate-400">No products found matching criteria.</td></tr>
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
                
                {pagination && pagination.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total items)
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                className="btn btn-outline" 
                                disabled={pagination.current_page === 1}
                                onClick={() => pagination.onPageChange(pagination.current_page - 1)}
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                                Previous
                            </button>
                            <button 
                                className="btn btn-outline" 
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => pagination.onPageChange(pagination.current_page + 1)}
                                style={{ padding: '6px 12px', fontSize: '13px' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
