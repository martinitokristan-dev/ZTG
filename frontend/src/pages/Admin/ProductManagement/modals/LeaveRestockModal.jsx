import React from 'react';

export default function LeaveRestockModal({ isOpen, onClose, onSaveDraft, onDiscard }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '28rem' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Leave Restock?</h3>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>

                <div className="p-6 flex flex-col gap-4 text-center">
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        You have restock changes in progress. Save them as a draft to continue later, or discard them entirely.
                    </p>

                    <div className="flex flex-col gap-2 mt-2">
                        <button
                            onClick={onSaveDraft}
                            className="w-full py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-extrabold shadow-sm transition-all"
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={onDiscard}
                            className="w-full py-2 border border-red-200 text-red-605 hover:bg-red-50 bg-white rounded-lg text-xs font-extrabold shadow-sm transition-all"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-extrabold bg-transparent border-0 mt-1 cursor-pointer transition-colors"
                        >
                            Keep Editing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
