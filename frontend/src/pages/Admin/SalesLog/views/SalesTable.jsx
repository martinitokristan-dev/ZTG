import React from 'react';

export default function SalesTable({ loading, items, fmt, fmtDate }) {
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading sales data...</div>;
    }

    if (items.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                No sales items found for the selected filters.
            </div>
        );
    }

    const getStatusBadge = (status) => {
        let bg = '#FEF3C7', color = '#D97706', icon = (
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
        );
        let text = 'Pending';

        if (status === 'Completed' || status === 'Paid' || status === 'P.O. Approved') {
            bg = '#DCFCE7'; color = '#16A34A'; text = 'Completed';
            icon = (
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            );
        } else if (status === 'Refund' || status === 'Return') {
            bg = '#FEE2E2'; color = '#DC2626'; text = 'Refund';
            icon = (
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
            );
        }

        return (
            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: bg, color: color, display: 'inline-flex', alignItems: 'center' }}>
                {icon} {text}
            </span>
        );
    };

    return (
        <div className="card table-card" style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>DATE</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>S.I./C.I./D.R.</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>PART NO.</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>PRODUCT</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>QTY</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>AMOUNT</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>CUSTOMER</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>PAYMENT</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>SERVED BY</th>
                            <th style={{ padding: '12px 16px', fontWeight: '700' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px' }}>
                        {items.map((item, i) => {
                            const isDeduction = (item._txStatus === 'Refund' || item._txStatus === 'Return' || item._txStatus === 'Void');
                            const amountColor = isDeduction ? 'var(--danger, #DC2626)' : 'var(--success, #16A34A)';
                            const amountPrefix = isDeduction ? '- ' : '';
                            const rowAmount = (item.price !== null && item.price !== undefined) ? item.price * item.qty : 0;

                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', color: '#64748B' }}>{fmtDate(item._txDate)}</td>
                                    <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{item._txReceipt || '-'}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.part_no || item.partNo || 'N/A'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</span>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.qty}</td>
                                    <td style={{ padding: '16px', fontWeight: '700', color: amountColor }}>{amountPrefix}{fmt(rowAmount)}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item._txCustomer}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item._txPayment}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{(item._txCashier || '-').split(' ')[0]}</td>
                                    <td style={{ padding: '16px' }}>{getStatusBadge(item._txStatus)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
