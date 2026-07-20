import React, { useState, useEffect, useRef } from 'react';

/**
 * ConfirmSaveModal
 *
 * Compliance confirmation gate for General Settings business detail changes.
 * Requires the admin to type "CONFIRM" before the save proceeds.
 *
 * Design rules (per approved spec):
 *  - Informational text only — no BIR / accountant / developer contact mention
 *  - Cancel retains dirty form edits without saving
 *  - Save button is disabled until the exact word CONFIRM is typed (case-insensitive, trimmed)
 */
export default function ConfirmSaveModal({ isOpen, onConfirm, onCancel }) {
    const [typed, setTyped] = useState('');
    const inputRef = useRef(null);

    // Reset input each time the modal opens; auto-focus the input
    useEffect(() => {
        if (isOpen) {
            setTyped('');
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isConfirmed = typed.trim().toUpperCase() === 'CONFIRM';

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isConfirmed) onConfirm();
        if (e.key === 'Escape') onCancel();
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div style={{
                background: 'var(--bg-card, #fff)',
                borderRadius: '16px',
                padding: '32px 28px 24px',
                width: '100%',
                maxWidth: '460px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                border: '1px solid var(--border, #E2E8F0)'
            }}>
                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                            <path fill="#F59E0B" fillRule="evenodd" clipRule="evenodd"
                                d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm0 5.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V8.5A.75.75 0 0 1 12 7.75Zm0 8.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
                        </svg>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary, #1E293B)' }}>
                        Confirm Business Details Update
                    </h2>
                </div>

                {/* Informational text — no BIR/accountant/developer references per spec */}
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', lineHeight: '1.6', marginBottom: '20px' }}>
                    You are about to update your business details (Business Name, Address, Branch, Contact,
                    TIN, or Tax Rate). These details will apply to all <strong>new</strong> transactions and
                    printed receipts going forward.
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', lineHeight: '1.6', marginBottom: '24px', marginTop: '-12px' }}>
                    Existing completed transactions will keep their own original frozen data and will not be affected.
                </p>

                {/* Type-to-confirm input */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        display: 'block', fontSize: '12.5px', fontWeight: '600',
                        color: 'var(--text-primary, #1E293B)', marginBottom: '8px'
                    }}>
                        Type <span style={{ fontFamily: 'monospace', background: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>CONFIRM</span> to proceed:
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type CONFIRM"
                        autoComplete="off"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            border: `2px solid ${isConfirmed ? '#10B981' : typed.length > 0 ? '#EF4444' : 'var(--border, #CBD5E1)'}`,
                            borderRadius: '8px',
                            outline: 'none',
                            background: 'var(--bg-secondary, #F8FAFC)',
                            color: 'var(--text-primary, #1E293B)',
                            transition: 'border-color 0.15s',
                            boxSizing: 'border-box',
                        }}
                    />
                    {typed.length > 0 && !isConfirmed && (
                        <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '5px' }}>
                            Type exactly CONFIRM to enable the save button.
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        style={{ minWidth: '90px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        style={{ minWidth: '120px', opacity: isConfirmed ? 1 : 0.45, cursor: isConfirmed ? 'pointer' : 'not-allowed' }}
                    >
                        Save & Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
