import React from 'react';

export default function ReviewRestockModal({
    isOpen, onClose, onConfirm,
    products, restockQuantities,
    restockItemsCount, restockUnitsCount,
    restockVerifiedBy, restockDate, restockTime,
    errorMessage,
    DEFAULT_PLACEHOLDER_IMAGE,
}) {
    if (!isOpen) return null;

    const restockItems = products.filter(p => (restockQuantities[p.id] || 0) > 0);

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '42rem' }}>
                <div className="modal-header">
                    <div>
                        <h3 className="modal-title flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Review Restock Order
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Please verify the items and quantities below before processing.</p>
                    </div>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>

                <div className="p-6 flex flex-col gap-5">
                    {errorMessage && <div className="p-2.5 bg-red-50 border border-red-100 text-red-800 rounded text-[11px] font-bold">{errorMessage}</div>}

                    {/* Items table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="max-h-[200px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-450 uppercase">
                                        <th className="py-2.5 px-4">Product</th>
                                        <th className="py-2.5 px-4 text-center">Current Stock</th>
                                        <th className="py-2.5 px-4 text-center">Adding Qty</th>
                                        <th className="py-2.5 px-4 text-center">New Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restockItems.map(p => {
                                        const adding = restockQuantities[p.id] || 0;
                                        return (
                                            <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30">
                                                <td className="py-3 px-4 flex items-center gap-3">
                                                    <img src={p.image || DEFAULT_PLACEHOLDER_IMAGE} alt={p.name}
                                                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                                                        onError={(e) => { e.target.src = DEFAULT_PLACEHOLDER_IMAGE; }} />
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-800 block">{p.name}</span>
                                                        <span className="text-[10px] text-slate-455 font-bold block uppercase mt-0.5">Part No: {p.part_no}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-xs font-semibold text-slate-600 text-center">{p.stock} units</td>
                                                <td className="py-3 px-4 text-xs font-extrabold text-emerald-600 text-center">+{adding}</td>
                                                <td className="py-3 px-4 text-xs font-extrabold text-slate-800 text-center">{p.stock + adding} units</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary grid */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-slate-500 font-bold">Total Items to Restock: <span className="text-slate-855 font-extrabold">{restockItemsCount}</span></span>
                            <span className="text-xs text-slate-500 font-bold">Admin / Supervisor: <span className="text-slate-855 font-extrabold">{restockVerifiedBy}</span></span>
                        </div>
                        <div className="flex flex-col gap-2 text-right">
                            <span className="text-xs text-slate-500 font-bold">Total Units Added: <span className="text-blue-600 font-extrabold">{restockUnitsCount} units</span></span>
                            <span className="text-xs text-slate-500 font-bold">Date & Time: <span className="text-slate-855 font-semibold">{restockDate}, {restockTime}</span></span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-250 text-slate-500 rounded-lg text-xs font-bold bg-white hover:bg-slate-50">Cancel</button>
                    <button onClick={onConfirm} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Confirm & Restock
                    </button>
                </div>
            </div>
        </div>
    );
}
