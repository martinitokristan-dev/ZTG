import React from 'react';

export default function RuleModal({
    showRuleModal, setShowRuleModal,
    ruleForm, setRuleForm, handleRuleSubmit
}) {
    if (!showRuleModal) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-content-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-slate-800">Create Alert Rule</h3>
                    <button type="button" onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <form onSubmit={handleRuleSubmit}>
                    <div className="p-6 flex flex-col gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rule Name *</label>
                            <input 
                                type="text" 
                                required 
                                value={ruleForm.name}
                                onChange={(e) => setRuleForm({...ruleForm, name: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                                placeholder="e.g. Critical Undercarriage Alert"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Trigger Event *</label>
                            <select 
                                value={ruleForm.event_type}
                                onChange={(e) => setRuleForm({...ruleForm, event_type: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none font-semibold"
                            >
                                <option value="low_stock">Low Stock</option>
                                <option value="out_of_stock">Out of Stock</option>
                                <option value="damaged_stock">Log Damaged</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Threshold Qty *</label>
                            <input 
                                type="number" 
                                required 
                                min="0"
                                value={ruleForm.threshold}
                                onChange={(e) => setRuleForm({...ruleForm, threshold: parseInt(e.target.value) || 0})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowRuleModal(false)} className="px-4 py-2 border border-slate-250 text-slate-500 rounded-lg text-xs font-bold bg-white hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow">Save Rule</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
