import React, { useState, useEffect } from 'react';

export default function VoidModal({ isOpen, onClose, onSubmit, transaction, fmtDate, fmt }) {
    const [reason, setReason] = useState('Wrong Transaction / Input Error');
    const [restoreStock, setRestoreStock] = useState(true);
    const [adminName, setAdminName] = useState('Administrator');
    const [adminPin, setAdminPin] = useState('');
    const [showPin, setShowPin] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReason('Wrong Transaction / Input Error');
            setRestoreStock(true);
            setAdminName('Administrator');
            setAdminPin('');
            setShowPin(false);
        }
    }, [isOpen]);

    if (!isOpen || !transaction) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
        const adminId = user?.id || 1;

        const payload = {
            void_reason: reason,
            restore_stock: restoreStock,
            admin_id: adminId,
            admin_pin: adminPin
        };

        onSubmit(transaction.id, payload);
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
            <div className="modal-card" style={{ maxWidth: '540px', width: '95%', background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)', border: '1px solid #E2E8F0' }}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header" style={{ position: 'relative', background: '#FEF2F2', borderBottom: '1px solid #FCA5A5', padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '8px' }}>
                        <button type="button" style={{ position: 'absolute', top: '16px', right: '16px', color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={onClose}>
                            <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div style={{
                            width: '42px', height: '42px',
                            background: '#FFF5F5',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1.5px solid #EF4444',
                            flexShrink: 0
                        }}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ color: '#DC2626' }}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                        </div>
                        <div>
                            <h3 style={{ color: '#991B1B', fontSize: '18px', fontWeight: '700', margin: '0 0 2px 0', fontFamily: '"Outfit", sans-serif' }}>
                                Void Transaction
                            </h3>
                            <p style={{ color: '#7F1D1D', fontSize: '12px', margin: 0 }}>Admin authorization required — Cashier must physically request this action</p>
                        </div>
                    </div>
    
                    <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
    
                        {/* Warning Banner */}
                        <div style={{ background: '#FFF5F5', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '12px 16px', fontSize: '12.5px', color: '#991B1B' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                <span><strong>This action cannot be undone.</strong> Voiding cancels the sale and generates an Official Receipt (OR-VOID) as proof. Only proceed after the cashier's physical request.</span>
                            </div>
                        </div>
    
                        {/* Original Transaction Info */}
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Original Transaction</h4>
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px' }}>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>Invoice No.</span>
                                    <span style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>{transaction.si_no || transaction.receipt_number || '—'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>Date & Time</span>
                                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '13.5px' }}>{fmtDate(transaction.date || transaction.created_at)}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>Customer</span>
                                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '13.5px' }}>{transaction.customer?.name || 'Walk-in'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>Cashier</span>
                                    <span style={{ fontWeight: '600', color: '#0F172A', fontSize: '13.5px' }}>{transaction.cashier?.name || '—'}</span>
                                </div>
                                <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #E2E8F0', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount to Void</span>
                                    <span style={{ fontWeight: '800', color: '#EF4444', fontSize: '18px' }}>{fmt(transaction.amount || transaction.total)}</span>
                                </div>
                            </div>
                        </div>
    
                        {/* Void Reason */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Void Reason <span style={{ color: '#EF4444' }}>*</span></label>
                            <select className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} required style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', width: '100%', backgroundColor: '#FFFFFF', outline: 'none' }}>
                                <option value="Wrong Transaction / Input Error">Wrong Transaction / Input Error</option>
                                <option value="Duplicate Entry">Duplicate Entry</option>
                                <option value="System Error">System Error</option>
                                <option value="Price Discrepancy">Price Discrepancy</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
    
                        {/* Stock Restoration */}
                        <div>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#334155', fontWeight: '500', userSelect: 'none' }}>
                                <input type="checkbox" checked={restoreStock} onChange={(e) => setRestoreStock(e.target.checked)} style={{ accentColor: '#EF4444', width: '16px', height: '16px', margin: 0, cursor: 'pointer' }} />
                                <span>Restore items to inventory (recommended)</span>
                            </label>
                        </div>
    
                        {/* Admin Authorization Box */}
                        <div style={{ background: '#FFFDF5', border: '1px solid #FEF3C7', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ fontSize: '11px', fontWeight: '700', color: '#B45309', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Admin Authorization
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#92400E' }}>Admin Name <span style={{ color: '#EF4444' }}>*</span></label>
                                <select className="form-control" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={{ border: '1px solid #FCD34D', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', width: '100%', background: '#FFFFFF', outline: 'none' }}>
                                    <option value="Administrator">Administrator (Default)</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: '#92400E' }}>4-Digit Admin PIN <span style={{ color: '#EF4444' }}>*</span></label>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <input type={showPin ? "text" : "password"} className="form-control" maxLength="4" pattern="\d{4}" required placeholder="••••" value={adminPin} onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))} style={{ border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 40px 12px 40px', fontSize: '20px', width: '100%', letterSpacing: '10px', textAlign: 'center', background: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }} />
                                    <button type="button" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '4px', color: '#A1A1AA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }} onClick={() => setShowPin(!showPin)}>
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                                            {showPin ? (
                                                <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                                            ) : (
                                                <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <div className="modal-footer" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '8px', fontWeight: '500', fontSize: '13.5px', height: '38px', padding: '0 20px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" className="btn btn-danger" style={{ background: '#EF4444', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px', height: '38px', padding: '0 20px', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                            Process Void
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
