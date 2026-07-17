import React, { useState } from 'react';
import { printUnifiedReceipt } from '../../../../utils/printReceipt';
import StatusBadge from '../../../../shared/components/StatusBadge';

export default function HistoryTable({ 
    loading, transactions, fmt, fmtDate, 
    handleOpenRefund, handleOpenVoid, handleOpenView 
}) {
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (id, e) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const handleReprint = (tx) => {
        let splitDetails = '';
        if (tx.payment && tx.payment.startsWith('Split:')) {
            splitDetails += `<tr><td style="padding:3px 0;font-size:11px;color:#374151;">Payment Method:</td><td style="padding:3px 0;font-size:11px;text-align:right;font-weight:600;">Split Payment</td></tr>`;
            const parts = tx.payment.replace('Split: ', '').split(' & ');
            parts.forEach(p => {
                const match = p.match(/^(.+)\\s\\(₱(.+)\\)$/);
                if (match) splitDetails += `<tr><td style="padding:2px 0 2px 8px;font-size:11px;color:#374151;">- ${match[1]}:</td><td style="padding:2px 0;font-size:11px;text-align:right;">&#8369;${match[2]}</td></tr>`;
            });
            if (tx.amount_tendered && tx.amount_tendered > 0) {
                splitDetails += `<tr><td style="padding:3px 0;font-size:11px;color:#374151;">Cash Tendered:</td><td style="padding:3px 0;font-size:11px;text-align:right;">&#8369;${Number(tx.amount_tendered).toLocaleString(undefined,{minimumFractionDigits:2})}</td></tr>`;
                const cd = Math.max(0, tx.amount_tendered - tx.total_amount);
                splitDetails += `<tr><td style="padding:3px 0;font-size:11px;color:#374151;">Change:</td><td style="padding:3px 0;font-size:11px;text-align:right;">&#8369;${Number(cd).toLocaleString(undefined,{minimumFractionDigits:2})}</td></tr>`;
            }
        }

        printUnifiedReceipt({
            type: tx.status === 'Refund' ? 'Refund' : tx.status === 'Return' ? 'Return' : tx.status === 'Void' ? 'Void' : 'Sales',
            invoiceNo: tx.si_no || tx.receipt_number,
            date: new Date(tx.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
            customer: tx.customer?.name || 'Walk-in',
            phone: tx.customer?.phone || '',
            buyerTin: tx.customer?.tin || '',
            buyerAddress: tx.customer?.address || '',
            items: tx.items || [],
            total: tx.total_amount,
            payment: tx.payment,
            tendered: tx.amount_tendered || 0,
            change: tx.change || 0,
            servedBy: tx.cashier?.name || 'Cashier',
            docType: 'S.I.',
            splitDetails: splitDetails,
            reason: tx.notes || '',
            originalInvoice: tx.original_receipt_number || '',
            approver: tx.voided_by || tx.refunded_by || ''
        });
        setOpenDropdownId(null);
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading history...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                No history logs found for the selected filters.
            </div>
        );
    }

    return (
        <div className="card table-card">
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: '700' }}>TRANSACTION DATE & TIME</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>RECEIPT/INVOICE</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>CUSTOMER NAME</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>SERVED BY</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>PAYMENT METHOD</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>STATUS</th>
                            <th style={{ padding: '16px', fontWeight: '700' }}>REASON</th>
                            <th style={{ padding: '16px', fontWeight: '700', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px' }}>
                        {transactions.map(tx => {
                            // Date formatting
                            const fullDate = fmtDate(tx.date || tx.created_at) || '';
                            const [displayDate, ...timeParts] = fullDate.split(', ');
                            const displayTime = timeParts.join(', ');

                            // Linked reservation badge
                            let reservationDisplay = null;
                            if (tx.status === 'Deposit') {
                                reservationDisplay = <span style={{display: 'block', fontSize: '10px', color: '#D97706', fontWeight: '700', marginTop: '3px'}}>50% Deposit</span>;
                            } else if (tx.status === 'Paid' && tx.order_ref) {
                                reservationDisplay = <span style={{display: 'block', fontSize: '10px', color: '#059669', fontWeight: '700', marginTop: '3px'}}>Full Payment</span>;
                            } else if (tx.order_ref && tx.status === 'Completed') {
                                reservationDisplay = <span style={{display: 'block', fontSize: '10px', color: 'var(--primary)', fontWeight: '700', marginTop: '3px'}}>Pickup · {tx.order_ref}</span>;
                            }

                            return (
                                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ display: 'block', color: 'var(--text-primary)', fontSize: '13px' }}>{displayDate}</span>
                                        {displayTime && <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>{displayTime}</span>}
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                        {tx.si_no || tx.receipt_number || 'N/A'}
                                        {reservationDisplay}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{tx.customer?.name || 'Walk-in'}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{(tx.cashier?.name || 'Unknown').split(' ')[0]}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{tx.payment_method || '—'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <StatusBadge status={tx.status || 'Completed'} />
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748B', fontSize: '12px' }}>
                                        {tx.status === 'Refund' || tx.status === 'Return' ? (tx.refund_reason || '—') : 
                                         tx.status === 'Void' ? (tx.void_reason || '—') : '—'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                            <button 
                                                className="action-trigger-btn" 
                                                data-tooltip="View Transaction"
                                                onClick={() => handleOpenView(tx)}
                                                style={{ border: '1px solid #E2E8F0', background: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                            >
                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </button>
                                            <div className="actions-dropdown-container" style={{ position: 'relative' }}>
                                                <button 
                                                    className="action-trigger-btn" 
                                                    data-tooltip="More actions"
                                                    onClick={(e) => toggleDropdown(tx.id, e)}
                                                    style={{ border: '1px solid #E2E8F0', background: '#fff', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <circle cx="12" cy="5" r="2"></circle>
                                                        <circle cx="12" cy="12" r="2"></circle>
                                                        <circle cx="12" cy="19" r="2"></circle>
                                                    </svg>
                                                </button>
                                                {openDropdownId === tx.id && (
                                                    <div style={{
                                                        position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 999,
                                                        background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px',
                                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', padding: '6px', minWidth: '160px'
                                                    }}>
                                                        <button style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', borderRadius: '4px' }} onClick={() => handleReprint(tx)} onMouseOver={e => e.currentTarget.style.backgroundColor = '#F1F5F9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                                            Reprint SI
                                                        </button>
                                                        {tx.status === 'Completed' && (
                                                            <>
                                                                <div style={{ margin: '4px 0', borderTop: '1px solid #E2E8F0' }}></div>
                                                                <button style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', borderRadius: '4px' }} onClick={() => { handleOpenVoid(tx); setOpenDropdownId(null); }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                                                    Void Transaction
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
