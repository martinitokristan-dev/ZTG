import React from 'react';

export default function ProductsTab({
    activeSubTab, setActiveSubTab, settings, handleSettingInputChange, handleToggleSetting,
    categories, setSelectedCategory, setCategoryName, setShowCategoryModal, handleDeleteCategory, setCategoryVariants,
    newOptionValue, setNewOptionValue, handleAddVariantOption, handleDeleteVariantOption, getOptionsForType,
    handleSaveBulkSettings
}) {
    return (
        <div className="prod-tabs-layout">
            {/* Left Sidebar */}
            <div className="prod-vtab-sidebar">
                {[
                    { id: 'info', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>, label: 'Product Info' },
                    { id: 'categories', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label: 'Categories' },
                    { id: 'sizes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h18M3 12h12M3 17h6"/></svg>, label: 'Size Options' },
                    { id: 'quality', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>, label: 'Quality' },
                    { id: 'colors', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 010 18"/></svg>, label: 'Color Options' },
                    { id: 'pricing', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v20M2 12h20"/></svg>, label: 'Pricing Configuration' },
                    { id: 'warehouse', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Warehouse & Display' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`prod-vtab-btn ${activeSubTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, padding: '24px 32px' }}>
                    {/* PANEL: Product Info */}
                    {activeSubTab === 'info' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Product Information Settings</h4>
                                <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Configure display names, variant modes, pricing options, and warehouse tracking.</p>
                            </div>
                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Display Chinese names for products</span>
                                    <input type="checkbox" checked={settings.display_chinese_names === 'true'} onChange={() => handleToggleSetting('display_chinese_names')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Enable product variants (Size, Color, Quality)</span>
                                    <input type="checkbox" checked={settings.enable_product_variants === 'true'} onChange={() => handleToggleSetting('enable_product_variants')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Enable dual pricing (Original and Retail Price)</span>
                                    <input type="checkbox" checked={settings.enable_dual_pricing === 'true'} onChange={() => handleToggleSetting('enable_dual_pricing')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Track product warehouse locations (Aisle - Center - Hang)</span>
                                    <input type="checkbox" checked={settings.track_warehouse_locations === 'true'} onChange={() => handleToggleSetting('track_warehouse_locations')} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* PANEL: Categories */}
                    {activeSubTab === 'categories' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Product Categories</h4>
                                    <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Add categories and assign variant types — up to 2 per category.</p>
                                </div>
                                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => { setSelectedCategory(null); setCategoryName(''); setCategoryVariants([]); setShowCategoryModal(true); }}>
                                    <svg viewBox="0 0 24 24" style={{ width: '13px', height: '13px', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', verticalAlign: 'middle', marginRight: '4px' }}><path d="M12 5v14M5 12h14"/></svg>
                                    Add Category
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {categories.map(c => (
                                    <div key={c.id} className="cat-card">
                                        <div className="cat-card-info">
                                            <div className="cat-card-name">{c.name}</div>
                                            <div className="cat-variant-badges">
                                                {c.variants && c.variants.length > 0 ? c.variants.map(v => (
                                                    <span key={v} className={`cv-badge ${v}`}>
                                                        {v === 'quality' ? 'Quality' : v === 'color' ? 'Color' : 'Size'}
                                                    </span>
                                                )) : <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No variants assigned</span>}
                                            </div>
                                        </div>
                                        <div className="cat-card-actions">
                                            <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedCategory(c); setCategoryName(c.name); setCategoryVariants(c.variants || []); setShowCategoryModal(true); }}>Edit</button>
                                            <button className="btn btn-danger btn-sm" style={{ background: 'transparent', color: '#DC2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteCategory(c)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PANEL: Variants (Sizes, Quality, Colors) */}
                    {['sizes', 'quality', 'colors'].includes(activeSubTab) && (() => {
                        const typeMap = { sizes: 'Size', quality: 'Quality', colors: 'Color' };
                        const typeName = typeMap[activeSubTab];
                        const [editingVariantId, setEditingVariantId] = React.useState(null);
                        const [editValue, setEditValue] = React.useState('');

                        const handleEditClick = (opt) => {
                            setEditingVariantId(opt.id);
                            setEditValue(opt.value);
                        };

                        const handleSaveEdit = (optId) => {
                            handleUpdateVariantOption(optId, editValue);
                            setEditingVariantId(null);
                        };

                        const handleColorChange = (e) => {
                            const hex = e.target.value;
                            const colors = {
                                '#ff0000': 'Red', '#00ff00': 'Green', '#0000ff': 'Blue', '#000000': 'Black', '#ffffff': 'White',
                                '#ffff00': 'Yellow', '#00ffff': 'Cyan', '#ff00ff': 'Magenta', '#808080': 'Gray', '#800000': 'Maroon',
                                '#808000': 'Olive', '#008000': 'Dark Green', '#800080': 'Purple', '#008080': 'Teal', '#000080': 'Navy',
                                '#ffa500': 'Orange', '#a52a2a': 'Brown', '#ffc0cb': 'Pink', '#ffd700': 'Gold', '#c0c0c0': 'Silver'
                            };
                            let minD = Infinity, name = hex;
                            const hR = parseInt(hex.slice(1,3),16), hG = parseInt(hex.slice(3,5),16), hB = parseInt(hex.slice(5,7),16);
                            for (const [cHex, cName] of Object.entries(colors)) {
                                const cR = parseInt(cHex.slice(1,3),16), cG = parseInt(cHex.slice(3,5),16), cB = parseInt(cHex.slice(5,7),16);
                                const d = (hR-cR)**2 + (hG-cG)**2 + (hB-cB)**2;
                                if (d < minD && d < 10000) { minD = d; name = cName; } // Only snap if reasonably close
                            }
                            setNewOptionValue(name);
                        };

                        if (activeSubTab === 'quality') {
                            return (
                                <div className="prod-vtab-panel active">
                                    <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                        <h4 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Quality</h4>
                                        <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Fixed quality variant for marking product condition.</p>
                                    </div>
                                    <div className="variant-list">
                                        <div className="vitem" style={{ background: '#fffbeb', borderColor: '#fef3c7' }}>
                                            <div className="vitem-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: 600 }}>
                                                <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                                Low Quality
                                            </div>
                                            <div className="vitem-actions">
                                                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #d97706', color: '#d97706', textTransform: 'uppercase' }}>Fixed</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <svg viewBox="0 0 24 24" style={{ width: '12px', height: '12px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}>
                                            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                        This is a system-defined variant and cannot be modified.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="prod-vtab-panel active">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{typeName} Options</h4>
                                        <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Manage available {typeName.toLowerCase()} values for products.</p>
                                    </div>
                                    <div className="add-option-row" style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input type="text" className="form-control" placeholder={activeSubTab === 'colors' ? "e.g. Red, Blue, Black" : "e.g. XL, 32, 500ml"} style={{ width: '180px' }} value={newOptionValue} onChange={(e) => setNewOptionValue(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleAddVariantOption(typeName); }} />
                                        {activeSubTab === 'colors' && (
                                            <input type="color" defaultValue="#3b82f6" onChange={handleColorChange} style={{ width: '36px', height: '36px', padding: '2px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', background: '#fff' }} />
                                        )}
                                        <button className="btn btn-primary btn-sm" onClick={() => handleAddVariantOption(typeName)}>Add</button>
                                    </div>
                                </div>
                                <div className="variant-list">
                                    {getOptionsForType(typeName).map(opt => (
                                        <div key={opt.id} className="vitem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', border: '1px solid var(--border)', borderRadius: '6px', marginBottom: '8px', background: '#fff' }}>
                                            {editingVariantId === opt.id ? (
                                                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
                                                    <input type="text" className="form-control" value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus onKeyDown={(e) => { if(e.key === 'Enter') handleSaveEdit(opt.id); if(e.key === 'Escape') setEditingVariantId(null); }} style={{ flex: 1, height: '32px' }} />
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveEdit(opt.id)}>Save</button>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingVariantId(null)}>Cancel</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="vitem-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.value}</div>
                                                    <div className="vitem-actions" style={{ display: 'flex', gap: '6px' }}>
                                                        <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border)' }} onClick={() => handleEditClick(opt)}>Edit</button>
                                                        <button className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border)' }} onClick={() => handleDeleteVariantOption(opt.id)}>Remove</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {getOptionsForType(typeName).length === 0 && (
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0' }}>No options added yet.</p>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* PANEL: Pricing Configuration */}
                    {activeSubTab === 'pricing' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Pricing Configuration</h4>
                                <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Set price labels, define markup rules, and enable auto-calculation for Price 2.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Original Price Label</label>
                                    <input type="text" className="form-control" value={settings.price1_label || ''} onChange={(e) => handleSettingInputChange('price1_label', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Retail Price Label</label>
                                    <input type="text" className="form-control" value={settings.price2_label || ''} onChange={(e) => handleSettingInputChange('price2_label', e.target.value)} />
                                </div>
                            </div>
                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: '16px' }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Automatically calculate Price 2 based on percentage markup</span>
                                    <input type="checkbox" checked={settings.auto_calc_price2 === 'true'} onChange={() => handleToggleSetting('auto_calc_price2')} />
                                </label>
                            </div>
                            {settings.auto_calc_price2 === 'true' && (
                                <div className="form-group" style={{ maxWidth: '240px', marginBottom: 0 }}>
                                    <label className="form-label">Retail Price Markup Percentage (%)</label>
                                    <input type="number" className="form-control" value={settings.price2_markup_percent || ''} onChange={(e) => handleSettingInputChange('price2_markup_percent', e.target.value)} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* PANEL: Warehouse & Display */}
                    {activeSubTab === 'warehouse' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Warehouse Location Format</h4>
                                <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Define how warehouse locations are structured and labeled.</p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 0 }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Location Format</label>
                                    <input type="text" className="form-control" value={settings.location_format || ''} onChange={(e) => handleSettingInputChange('location_format', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Number of Aisles</label>
                                    <input type="number" className="form-control" value={settings.number_of_aisles || ''} onChange={(e) => handleSettingInputChange('number_of_aisles', e.target.value)} />
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0 20px' }}></div>

                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px' }}>Product Display Options</h4>
                                <p className="panel-desc" style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Control how products are shown in the POS interface.</p>
                            </div>
                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Always display part numbers</span>
                                    <input type="checkbox" checked={settings.always_display_part_numbers === 'true'} onChange={() => handleToggleSetting('always_display_part_numbers')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Show stock levels in POS</span>
                                    <input type="checkbox" checked={settings.show_stock_levels_pos === 'true'} onChange={() => handleToggleSetting('show_stock_levels_pos')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Hide out-of-stock products from POS</span>
                                    <input type="checkbox" checked={settings.hide_oos_pos === 'true'} onChange={() => handleToggleSetting('hide_oos_pos')} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}

