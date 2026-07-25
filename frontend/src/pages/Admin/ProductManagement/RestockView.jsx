import React from 'react';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import IOSDatePicker from '../../../shared/components/IOSDatePicker';
import IOSSelect from '../../../shared/components/IOSSelect';
import IOSTimePicker from '../../../shared/components/IOSTimePicker';

export default function RestockView({
    products,
    categories,
    loading,
    restockSearch, setRestockSearch,
    restockCategory, setRestockCategory,
    restockStockLevel, setRestockStockLevel,
    restockQuantities, updateRestockQty, handleClearAllRestock,
    restockDate, setRestockDate,
    restockTime, setRestockTime,
    restockVerifiedBy,
    restockItemsCount, restockUnitsCount,
    onExit, onReview,
    DEFAULT_PLACEHOLDER_IMAGE,
}) {
    return (
        <>
            {/* Restock Search & Filters */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                        <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by part number or name..."
                            value={restockSearch}
                            onChange={(e) => setRestockSearch(e.target.value)}
                            style={{ width: '100%', background: 'white', border: '1px solid #E2E8F0', padding: '8px 12px 8px 44px', borderRadius: '10px', fontSize: '13px', outline: 'none', color: '#0F172A' }}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <IOSSelect
                            value={restockCategory}
                            onChange={(e) => setRestockCategory(e.target.value)}
                            options={[{ value: '', label: 'All Categories' }, ...categories.map(c => ({ value: c.id, label: c.name }))]}
                        />
                    </div>
                    <div style={{ width: '160px' }}>
                        <IOSSelect
                            value={restockStockLevel}
                            onChange={(e) => setRestockStockLevel(e.target.value)}
                            options={[
                                { value: 'All', label: 'All Stock Levels' },
                                { value: 'Low Stock', label: 'Low Stock' },
                                { value: 'No Stock', label: 'No Stock' }
                            ]}
                        />
                    </div>
                    <button onClick={handleClearAllRestock}
                        style={{ padding: '8px 16px', border: '1px solid #FECACA', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#EF4444', background: '#FFFFFF', cursor: 'pointer' }}>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Batch Restock Table */}
            <div className="card table-card" style={{ marginBottom: '16px' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Part No.</th>
                                <th>Category</th>
                                <th>Address</th>
                                <th>Current Stock</th>
                                <th style={{ textAlign: 'center', width: '120px' }}>Restock Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '32px' }}><LoadingSpinner text="Loading catalog items..." minHeight="100px" /></td></tr>
                            ) : products.length === 0 ? (
                                <tr><td colSpan="6" className="py-8 text-center text-xs font-semibold text-slate-400">No products found.</td></tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={p.image || DEFAULT_PLACEHOLDER_IMAGE} alt={p.name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                                                    onError={(e) => { e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }} />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{p.name}</span>
                                                    {p.chinese_name && <span className="text-[10px] text-slate-400 font-medium mt-0.5">{p.chinese_name}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-xs font-bold text-slate-655">{p.part_no}</td>
                                        <td className="py-3 px-4 text-xs text-slate-550 font-semibold">{p.category?.name || 'Unassigned'}</td>
                                        <td className="py-3 px-4 text-xs text-slate-500 uppercase font-semibold">{p.address || '—'}</td>
                                        <td className="py-3 px-4 text-xs font-extrabold text-slate-700">{p.stock}</td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number" min="0"
                                                value={restockQuantities[p.id] !== undefined ? restockQuantities[p.id] : ''}
                                                onChange={(e) => updateRestockQty(p.id, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                className="w-24 px-3 py-1.5 border border-slate-200 rounded text-xs text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Restock Footer Bar */}
            <div className="restock-footer-bar">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <div style={{ width: '160px' }}>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Restock Date</label>
                        <IOSDatePicker value={restockDate} onChange={(e) => setRestockDate(e.target.value)} placeholder="Restock Date" />
                    </div>
                    <div style={{ width: '140px' }}>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Restock Time</label>
                        <IOSTimePicker value={restockTime} onChange={(e) => setRestockTime(e.target.value)} placeholder="Restock Time" />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>Admin / Supervisor</label>
                        <input type="text" value={restockVerifiedBy} readOnly className="form-control"
                            style={{ borderRadius: '10px', backgroundColor: '#F1F5F9', cursor: 'not-allowed' }} />
                    </div>
                </div>

                <div style={{ background: '#ECFDF5', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#059669', fontWeight: 600, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Items to restock: <strong>{restockItemsCount}</strong></span>
                    <span>Total units: <strong>{restockUnitsCount}</strong></span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Changes auto-save as you type</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={onExit} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={onReview}
                        disabled={restockUnitsCount === 0}
                        className={`btn ${restockUnitsCount > 0 ? 'btn-success' : 'btn-secondary'}`}
                        style={restockUnitsCount === 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                    >
                        Review & Confirm Restock
                    </button>
                </div>
            </div>
        </>
    );
}
