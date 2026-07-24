import React from 'react';

export default function DamageLogModal({ isOpen, onClose, onSubmit, product, damageQty, setDamageQty, damageReason, setDamageReason, errorMessage, isSubmitting = false }) {
    if (!isOpen || !product) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Log Damaged Stock</h3>
                    <button onClick={onClose} className="modal-close" disabled={isSubmitting}>✕</button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="p-6 flex flex-col gap-4">
                        {errorMessage && (
                            <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 rounded text-[11px] font-bold">{errorMessage}</div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Target Product</label>
                            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg">
                                <span className="text-xs font-bold text-slate-800 block">{product.name}</span>
                                {product.chinese_name && <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{product.chinese_name}</span>}
                                <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">
                                    Part: {product.part_no} | Current Stock: {product.stock}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Damaged Qty *</label>
                            <input
                                type="number" required min="1" max={product.stock}
                                value={damageQty}
                                onChange={(e) => setDamageQty(parseInt(e.target.value) || 1)}
                                className="w-full p-2 border border-slate-250 rounded text-xs focus:outline-none focus:border-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Damage Reason / Notes *</label>
                            <input
                                type="text" required placeholder="e.g. Cracked during delivery"
                                value={damageReason}
                                onChange={(e) => setDamageReason(e.target.value)}
                                className="w-full p-2 border border-slate-250 rounded text-xs focus:outline-none focus:border-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="modal-footer flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-250 text-slate-500 rounded text-xs font-bold bg-white hover:bg-slate-50" disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1.5" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                                    Logging Damage...
                                </>
                            ) : (
                                'Log Damage'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
