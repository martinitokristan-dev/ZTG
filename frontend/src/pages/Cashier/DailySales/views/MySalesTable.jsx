import React from 'react';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import StatusBadge from '../../../../shared/components/StatusBadge';
import { exportSalesToExcel } from '../../../../shared/utils/clientExcelExporter';

export default function MySalesTable({ loading, items, fmt, fmtDate }) {
    if (loading) return <LoadingSpinner text="Loading sales data..." minHeight="200px" />;

    if (items.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                No sales items found for the selected filters.
            </div>
        );
    }

    const handleExportExcel = () => {
        const flattened = items.map(item => ({
            qty: item.qty,
            price: item.price,
            name: item.name,
            partNo: item.part_no || item.partNo,
            tx: {
                date: item._txDate,
                si_no: item._txReceipt,
                customer_name: item._txCustomer,
                payment_method: item._txPayment,
                status: item._txStatus,
                cashier: { name: item._txChecker }
            }
        }));
        exportSalesToExcel(flattened, { filename: `My_Daily_Sales_${new Date().toISOString().slice(0, 10)}.xlsx` });
    };

    return (
        <div className="card table-card" style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div className="table-header-bar" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Fulfilled Sales Invoices</h3>
                <button 
                    className="btn btn-success btn-sm"
                    onClick={handleExportExcel}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '12px', 
                        borderRadius: '6px', padding: '6px 14px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                        border: 'none', color: '#FFFFFF', cursor: 'pointer'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    Export Excel (.xlsx)
                </button>
            </div>
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
