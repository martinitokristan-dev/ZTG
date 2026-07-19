import React, { useState } from 'react';
import api from '../../../../shared/api';
import { resetReportsCache } from '../../../../shared/hooks/useReportsCache';
import StatusBadge from '../../../../shared/components/StatusBadge';

export default function SalesReportTab({ salesSummary, fmt, fmtDate, isReportGenerated, setIsReportGenerated, startDate, setStartDate, endDate, setEndDate }) {
    const [confirming, setConfirming] = useState(false);
    const [hasExported, setHasExported] = useState(false);

    // Calculate flattened items and totals
    const flattenedTransactionsItems = [];
    let totalQty = 0;
    let totalAmount = 0;

    if (salesSummary?.transactions) {
        salesSummary.transactions.forEach(tx => {
            const items = (tx.items && tx.items.length > 0) ? tx.items : [{
                id: null,
                name: tx.itemName || 'Transaction',
                partNo: 'N/A',
                qty: 1,
                price: tx.amount
            }];
            items.forEach(item => {
                flattenedTransactionsItems.push({
                    ...item,
                    tx
                });

                const isDeduction = (tx.status === 'Refund' || tx.status === 'Return' || tx.status === 'Void');
                const rowAmount = item.qty * (item.price || 0);
                totalQty += item.qty || 0;
                if (isDeduction) {
                    totalAmount -= rowAmount;
                } else {
                    totalAmount += rowAmount;
                }
            });
        });
    }

    const handleExportCSV = () => {
        if (flattenedTransactionsItems.length === 0) return;

        // Build CSV header & rows
        const headers = ["Date", "S.I./C.I./D.R.", "Part No.", "Product", "Qty", "Amount", "Payment", "Served By", "Status"];
        const csvRows = [headers.join(",")];

        flattenedTransactionsItems.forEach(item => {
            const tx = item.tx;
            const isDeduction = (tx.status === 'Refund' || tx.status === 'Return' || tx.status === 'Void');
            const resolvedName = (item.product?.name || item.name || 'Unknown Product').replace(/"/g, '""');
            const resolvedPartNo = item.product?.part_no || item.partNo || 'N/A';
            const rowAmount = item.qty * (item.price || 0);
            const displayAmount = isDeduction ? `-${rowAmount}` : `${rowAmount}`;

            const row = [
                `"${fmtDate(tx.date || tx.created_at)}"`,
                `"${tx.si_no || tx.receipt_number || '-'}"`,
                `"${resolvedPartNo}"`,
                `"${resolvedName}"`,
                item.qty,
                displayAmount,
                `"${tx.payment_method}"`,
                `"${tx.checker?.name || '—'}"`,
                `"${tx.status}"`
            ];
            csvRows.push(row.join(","));
        });

        // Download CSV file
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Sales_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setHasExported(true);
    };

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
                        className="btn btn-success" 
                        onClick={handleExportCSV}
                        disabled={flattenedTransactionsItems.length === 0}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', 
                            borderRadius: '8px', padding: '8px 20px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                            border: 'none', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
                            cursor: flattenedTransactionsItems.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                        Export CSV
                    </button>

                    {isReportGenerated ? (
                        <button className="btn" style={{ background: '#E2E8F0', color: '#64748B', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', borderRadius: '8px', padding: '8px 20px', border: 'none' }} disabled>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            Report Confirmed
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary" 
                            onClick={handleConfirm} 
                            disabled={confirming || !hasExported} 
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', 
                                borderRadius: '8px', padding: '8px 20px', 
                                background: (!hasExported) ? '#93C5FD' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', 
                                border: 'none', 
                                color: (!hasExported) ? '#EFF6FF' : '#FFFFFF',
                                cursor: (!hasExported || confirming) ? 'not-allowed' : 'pointer',
                                boxShadow: (!hasExported) ? 'none' : '0 4px 12px rgba(37,99,235,0.2)' 
                            }}
                            title={!hasExported ? "Please export CSV first to enable confirmation" : ""}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            {confirming ? 'Confirming...' : 'Confirm Daily Report'}
                        </button>
                    )}
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
                                <th>PART NO.</th>
                                <th>PRODUCT</th>
                                <th>QTY</th>
                                <th>AMOUNT</th>
                                <th>PAYMENT</th>
                                <th>SERVED BY</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flattenedTransactionsItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No transactions found for the selected date range.
                                    </td>
                                </tr>
                            ) : (
                                flattenedTransactionsItems.map((item, i) => {
                                    const tx = item.tx;
                                    const isDeduction = (tx.status === 'Refund' || tx.status === 'Return' || tx.status === 'Void');
                                    const isPending = tx.status === 'Pending';
                                    const amountColor = (isDeduction || isPending) ? 'var(--danger, #DC2626)' : 'var(--success, #16A34A)';
                                    const amountPrefix = isDeduction ? '- ' : '';
                                    const resolvedName = item.product?.name || item.name || 'Unknown Product';
                                    const resolvedPartNo = item.product?.part_no || item.partNo || 'N/A';
                                    const rowAmount = item.qty * (item.price || 0);

                                    return (
                                        <tr key={`${tx.id}-${item.id || i}`}>
                                            <td style={{ color: '#64748B' }}>{fmtDate(tx.date || tx.created_at)}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{tx.si_no || tx.receipt_number || '-'}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{resolvedPartNo}</td>
                                            <td><span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{resolvedName}</span></td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{item.qty}</td>
                                            <td style={{ fontWeight: '700', color: amountColor }}>{amountPrefix}{fmt(rowAmount)}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{tx.payment_method}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{((tx.checker?.name || tx.cashier?.name) || '—').split(' ')[0]}</td>
                                            <td><StatusBadge status={tx.status} /></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {flattenedTransactionsItems.length > 0 && (
                            <tfoot>
                                <tr style={{ borderTop: '2px solid var(--border)', background: '#F8FAFC' }}>
                                    <td style={{ fontWeight: '800', padding: '16px', color: 'var(--text-primary)' }}>Total:</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td style={{ fontWeight: '800', padding: '16px', color: 'var(--text-secondary)' }}>{totalQty}</td>
                                    <td style={{ fontWeight: '800', padding: '16px', color: 'var(--success, #16A34A)', fontSize: '15px' }}>{fmt(totalAmount)}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
}
