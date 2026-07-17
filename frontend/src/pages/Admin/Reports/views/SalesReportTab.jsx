import React, { useState } from 'react';
import api from '../../../../shared/api';
import { resetReportsCache } from '../../../../shared/hooks/useReportsCache';
import StatusBadge from '../../../../shared/components/StatusBadge';

export default function SalesReportTab({ salesSummary, fmt, fmtDate, isReportGenerated, setIsReportGenerated, startDate, setStartDate, endDate, setEndDate }) {
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = async () => {
        if (!window.confirm("Are you sure you want to confirm today's sales report?")) return;
        setConfirming(true);
        try {
            await api.post('/reports/mark-generated');
            resetReportsCache();
            setIsReportGenerated(true);
            alert("Daily sales report confirmed successfully.");
        } catch (err) {
            console.error("Failed to confirm report:", err);
            alert("Failed to confirm report. Make sure you have Admin privileges.");
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Date Filters */}
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Date Range:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="date" className="form-control form-control-sm" style={{ width: '150px' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
                        <input type="date" className="form-control form-control-sm" style={{ width: '150px' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px' }}>Cashier:</span>
                    <select className="form-control form-control-sm" style={{ width: '160px' }}>
                        <option value="All">All Cashiers</option>
                    </select>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px' }}>Payment:</span>
                    <select className="form-control form-control-sm" style={{ width: '160px' }}>
                        <option value="All">All Payments</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', opacity: isReportGenerated ? 0.6 : 1, cursor: isReportGenerated ? 'not-allowed' : 'pointer' }}
                        onClick={handleConfirm}
                        disabled={isReportGenerated || confirming}
                    >
                        {isReportGenerated ? (
                            <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'none', stroke: '#fff', strokeWidth: '2.5' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'none', stroke: '#fff', strokeWidth: '2.5' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        )}
                        {isReportGenerated ? "Report Confirmed" : (confirming ? "Confirming..." : "Confirm Daily Report")}
                    </button>
                    <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                        <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'none', stroke: '#fff', strokeWidth: '2.5' }}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Total Sales Revenue</div>
                    <div className="kpi-value">{salesSummary ? fmt(salesSummary.total_revenue || 0) : '₱0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Transactions</div>
                    <div className="kpi-value">{salesSummary ? salesSummary.transaction_count : '0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Average Transaction</div>
                    <div className="kpi-value">{salesSummary ? fmt(salesSummary.average_transaction || 0) : '₱0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Items Sold</div>
                    <div className="kpi-value">{salesSummary ? salesSummary.total_items_sold : '0'}</div>
                </div>
            </div>

            <div className="section-card">
                <div className="section-card-header">Sales Transactions</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>S.I./C.I./D.R.</th>
                                <th>PRODUCT</th>
                                <th>QTY</th>
                                <th>AMOUNT</th>
                                <th>PAYMENT</th>
                                <th>CASHIER</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!salesSummary?.transactions || salesSummary.transactions.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found for the selected date range.</td></tr>
                            ) : (
                                salesSummary.transactions.map((tx, i) => {
                                    const isDeduction = (tx.status === 'Refund' || tx.status === 'Return' || tx.status === 'Void');
                                    const amountColor = isDeduction ? 'var(--danger, #DC2626)' : 'var(--success, #16A34A)';
                                    const amountPrefix = isDeduction ? '- ' : '';
                                    const productNames = tx.items?.map(item => item.product?.name || item.name || '—').join(', ') || '—';
                                    
                                    return (
                                        <tr key={tx.id || i}>
                                            <td style={{ color: '#64748B' }}>{fmtDate(tx.date || tx.created_at)}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{tx.si_no || tx.receipt_number || '-'}</td>
                                            <td><span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{productNames}</span></td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{tx.total_qty || tx.items?.reduce((s, it) => s + (it.qty||0), 0) || 0}</td>
                                            <td style={{ fontWeight: '700', color: amountColor }}>{amountPrefix}{fmt(tx.amount)}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{tx.payment_method}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{(tx.cashier?.name || '-').split(' ')[0]}</td>
                                            <td><StatusBadge status={tx.status} /></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
