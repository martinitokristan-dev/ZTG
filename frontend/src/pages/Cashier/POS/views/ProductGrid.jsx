import React, { useState } from 'react';

const DEFAULT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80";

export default function ProductGrid({ 
    products, 
    loading, 
    categories, 
    searchQuery, setSearchQuery, 
    categoryFilter, setCategoryFilter,
    addToCart,
    fmt
}) {
    const [previewImage, setPreviewImage] = useState(null);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '16px', height: '100%' }}>
            {/* Search Box & Category Filters */}
            <div className="pos-header-search-container" style={{ maxWidth: 'none', margin: '0', alignItems: 'flex-start', background: 'var(--bg-card)', padding: '16px 20px', borderBottom: '1px solid var(--border)', borderRadius: '10px 10px 0 0' }}>
                <div className="pos-search-wrapper" style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
                    <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input 
                        type="text" 
                        className="pos-search-input" 
                        placeholder="Search products by name or part number..." 
                        style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '30px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: '#F8FAFC', outline: 'none' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', border: 'none',
                                background: categoryFilter === cat ? 'var(--primary)' : '#F1F5F9',
                                color: categoryFilter === cat ? '#FFFFFF' : '#475569'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Catalogue Table */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, flex: 1, minHeight: 0, background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '0 0 10px 10px' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif', margin: 0 }}>Catalogue Picker</h3>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table className="pos-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#FFFFFF' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Product</th>
                                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Part No.</th>
                                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Address</th>
                                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Stock</th>
                                <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>Original Price</th>
                                <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Retail Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Loading products...</td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>No products found.</td></tr>
                            ) : products.map(p => {
                                const isLow = p.stock > 0 && p.stock <= 5;
                                const isOut = p.stock <= 0;
                                const stockClass = isOut ? { bg: '#FDE8E8', color: '#9B1C1C' } : isLow ? { bg: '#FEF3C7', color: '#92400E' } : { bg: '#DEF7EC', color: '#03543F' };

                                return (
                                    <tr 
                                        key={p.id} 
                                        onClick={() => !isOut && addToCart(p, 'price1')}
                                        style={{ borderBottom: '1px solid #F1F5F9', cursor: isOut ? 'not-allowed' : 'pointer', opacity: isOut ? 0.5 : 1 }}
                                        className="hover-row"
                                    >
                                        <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <img 
                                                    src={p.image || DEFAULT_PLACEHOLDER_IMAGE} 
                                                    alt={p.name} 
                                                    className="pos-product-image"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(p.image || DEFAULT_PLACEHOLDER_IMAGE);
                                                    }}
                                                    onError={(e) => { e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE; }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</div>
                                                    {p.chinese_name && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '2px' }}>{p.chinese_name}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>{p.part_no || p.partNo || 'N/A'}</td>
                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.category?.name || p.category || 'Uncategorized'}</td>
                                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.address || '—'}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                                                width: '24px', height: '24px', borderRadius: '50%', fontWeight: '700', fontSize: '11px',
                                                backgroundColor: stockClass.bg, color: stockClass.color
                                            }}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '700', textAlign: 'right', color: '#64748B' }}>
                                            {!isOut ? (
                                                <span 
                                                    onClick={(e) => { e.stopPropagation(); addToCart(p, 'price1'); }} 
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseOver={(ev) => ev.currentTarget.style.textDecoration='underline'}
                                                    onMouseOut={(ev) => ev.currentTarget.style.textDecoration='none'}
                                                >
                                                    {fmt(p.price1)}
                                                </span>
                                            ) : (
                                                <span>{fmt(p.price1)}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '700', textAlign: 'right', color: 'var(--primary)' }}>
                                            {!isOut ? (
                                                <span 
                                                    onClick={(e) => { e.stopPropagation(); addToCart(p, 'price2'); }} 
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseOver={(ev) => ev.currentTarget.style.textDecoration='underline'}
                                                    onMouseOut={(ev) => ev.currentTarget.style.textDecoration='none'}
                                                >
                                                    {fmt(p.price2)}
                                                </span>
                                            ) : (
                                                <span>{fmt(p.price2)}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            {previewImage && (
                <div 
                    onClick={() => setPreviewImage(null)}
                    style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', 
                        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <button 
                        onClick={() => setPreviewImage(null)}
                        style={{ 
                            position: 'absolute', top: '24px', right: '24px', 
                            background: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', 
                            width: '44px', height: '44px', display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                            color: '#FFFFFF',
                            backdropFilter: 'blur(4px)',
                            border: '1.5px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 2010
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor='rgba(255, 255, 255, 0.3)'; e.currentTarget.style.transform='scale(1.05)'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor='rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform='scale(1)'; }}
                    >
                        <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5' }}>
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        <img 
                            src={previewImage.replace('w=80', 'w=600')} 
                            alt="Preview" 
                            style={{ 
                                display: 'block', maxWidth: '90vw', maxHeight: '85vh', 
                                borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                            }} 
                        />
                    </div>
                </div>
            )}
            <style>{`
                .pos-search-input:focus {
                    background-color: #FFFFFF !important;
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15) !important;
                }
                .hover-row:hover {
                    background-color: #F8FAFC;
                }
                .pos-product-image {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    object-fit: cover;
                    background-color: #F1F5F9;
                    border: 1px solid #E2E8F0;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .pos-product-image:hover {
                    transform: scale(1.15);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                    border-color: #3B82F6;
                }
            `}</style>
        </div>
    );
}
