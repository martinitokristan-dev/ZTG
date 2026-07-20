import React from 'react';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import StatusBadge from '../../../../shared/components/StatusBadge';

export default function SalesTable({ loading, items, fmt, fmtDate }) {
    if (loading) return <LoadingSpinner text="Loading sales data..." minHeight="200px" />;

    if (items.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                No sales items found for the selected filters.
            </div>
        );
    }

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
                            const isPending = item._txStatus === 'Pending';
                            const amountColor = (isDeduction || isPending) ? 'var(--danger, #DC2626)' : 'var(--success, #16A34A)';
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
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{(item._txChecker || '—').split(' ')[0]}</td>
                                    <td style={{ padding: '16px' }}><StatusBadge status={item._txStatus} /></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
