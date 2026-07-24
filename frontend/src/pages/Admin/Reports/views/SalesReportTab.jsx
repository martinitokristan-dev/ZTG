import React, { useState, useMemo } from 'react';
import IOSDatePicker from '../../../../shared/components/IOSDatePicker';
import IOSSelect from '../../../../shared/components/IOSSelect';
import api from '../../../../shared/api';
import { resetReportsCache } from '../../../../shared/hooks/useReportsCache';
import { exportSalesToExcel, getItemDiscountAmount } from '../../../../shared/utils/clientExcelExporter';
import StatusBadge from '../../../../shared/components/StatusBadge';

export default function SalesReportTab({ salesSummary, employees = [], fmt, fmtDate, isReportGenerated, setIsReportGenerated, startDate, setStartDate, endDate, setEndDate }) {
    const [confirming, setConfirming] = useState(false);
    const [hasExported, setHasExported] = useState(false);
    const [selectedCashier, setSelectedCashier] = useState('All');
    const [selectedPayment, setSelectedPayment] = useState('All');

    // Extract unique Cashiers (users with Cashier role, excluding Admin role)
    const cashierOptions = useMemo(() => {
        const set = new Set();
        if (employees && employees.length > 0) {
            employees.forEach(emp => {
                const role = (emp.role || '').toLowerCase();
                if (role === 'cashier') {
                    const name = emp.real_name || emp.name;
                    if (name) set.add(name.trim());
                }
            });
        }
        if (salesSummary?.transactions) {
            salesSummary.transactions.forEach(tx => {
                if (tx.cashier) {
                    const role = (tx.cashier.role || '').toLowerCase();
                    if (role === 'cashier') {
                        const name = tx.cashier.real_name || tx.cashier.name;
                        if (name) set.add(name.trim());
                    }
                }
            });
        }
        return Array.from(set);
    }, [employees, salesSummary]);

    // Extract unique Payment methods
    const paymentOptions = useMemo(() => {
        const baseOptions = ['Cash', 'GCash', 'Bank Transfer', 'P.O. (Pending)', 'Split'];
        if (!salesSummary?.transactions) return baseOptions;
        const set = new Set(baseOptions);
        salesSummary.transactions.forEach(tx => {
            if (tx.payment_method) {
                if (tx.payment_method.startsWith('Split')) {
                    set.add('Split');
                } else {
                    set.add(tx.payment_method);
                }
            }
        });
        return Array.from(set);
    }, [salesSummary]);

    // Filter transactions based on selected Cashier and Payment method
    const filteredTransactions = useMemo(() => {
        if (!salesSummary?.transactions) return [];
        return salesSummary.transactions.filter(tx => {
            if (selectedCashier !== 'All') {
                const cashierName = tx.cashier?.real_name || tx.cashier?.name || '';
                if (cashierName !== selectedCashier) return false;
            }
            if (selectedPayment !== 'All') {
                const pm = tx.payment_method || '';
                if (selectedPayment === 'Split') {
                    if (!pm.startsWith('Split')) return false;
                } else if (!pm.includes(selectedPayment)) {
                    return false;
                }
            }
            return true;
        });
    }, [salesSummary, selectedCashier, selectedPayment]);

    // Calculate dynamic KPI metrics for filtered data
    const { kpiTotalRevenue, kpiTotalTransactions, kpiAvgTransaction, kpiTotalItemsSold } = useMemo(() => {
        let rev = 0;
        let itemsSold = 0;
        let validTxCount = 0;

        filteredTransactions.forEach(tx => {
            if (tx.status === 'Completed' || tx.status === 'Pending') {
                rev += Number(tx.amount || 0);
                validTxCount += 1;
            }
            if (tx.items && tx.items.length > 0) {
                tx.items.forEach(it => {
                    itemsSold += (it.qty || 0);
                });
            } else {
                itemsSold += (tx.total_qty || 1);
            }
        });

        const avg = validTxCount > 0 ? rev / validTxCount : 0;
        return {
            kpiTotalRevenue: rev,
            kpiTotalTransactions: validTxCount,
            kpiAvgTransaction: avg,
            kpiTotalItemsSold: itemsSold,
        };
    }, [filteredTransactions]);

    // Calculate flattened items and totals for filtered data
    const flattenedTransactionsItems = [];
    let totalQty = 0;
    let totalAmount = 0;
    let totalDiscountAmount = 0;

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach(tx => {
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
                const unitPrice = Number(item.original_price || item.price || 0);
                const discountVal = getItemDiscountAmount(item, tx);
                const grossRowAmount = (item.qty || 1) * unitPrice;
                const netRowAmount = Math.max(0, grossRowAmount - discountVal);

                totalQty += item.qty || 0;
                totalDiscountAmount += discountVal;

                if (isDeduction) {
                    totalAmount -= netRowAmount;
                } else {
                    totalAmount += netRowAmount;
                }
            });
        });
    }

    const handleExportCSV = () => {
        if (flattenedTransactionsItems.length === 0) return;
        exportSalesToCSV(flattenedTransactionsItems, { startDate, endDate });
        setHasExported(true);
    };

    const handleExportExcel = () => {
        if (flattenedTransactionsItems.length === 0) return;
        exportSalesToExcel(flattenedTransactionsItems, { startDate, endDate });
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="table-filters" style={{ padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Date Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IOSDatePicker value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" style={{ width: '140px' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
                        <IOSDatePicker value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" style={{ width: '140px' }} alignRight={true} />
                    </div>
                    <div style={{ width: '150px' }}>
                        <IOSSelect
                            value={selectedCashier}
                            onChange={e => setSelectedCashier(e.target.value)}
                            options={[{ value: 'All', label: 'All Cashiers' }, ...cashierOptions.map(name => ({ value: name, label: name }))]}
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <IOSSelect
                            value={selectedPayment}
                            onChange={e => setSelectedPayment(e.target.value)}
                            options={[{ value: 'All', label: 'All Payments' }, ...paymentOptions.map(pm => ({ value: pm, label: pm }))]}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-success" 
                        onClick={handleExportExcel}
                        disabled={flattenedTransactionsItems.length === 0}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', 
                            borderRadius: '8px', padding: '8px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                            border: 'none', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                            cursor: flattenedTransactionsItems.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                        title="Export formatted Excel report matching Daily Sales template"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Export Excel
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
                            title={!hasExported ? "Please export Excel first to enable confirmation" : ""}
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
                    <div className="kpi-value">{salesSummary ? fmt(kpiTotalRevenue) : '₱0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Transactions</div>
                    <div className="kpi-value">{salesSummary ? kpiTotalTransactions : '0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Average Transaction</div>
                    <div className="kpi-value">{salesSummary ? fmt(kpiAvgTransaction) : '₱0'}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Items Sold</div>
                    <div className="kpi-value">{salesSummary ? kpiTotalItemsSold : '0'}</div>
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
                                <th style={{ textAlign: 'center' }}>QTY</th>
                                <th style={{ textAlign: 'right' }}>PRICE</th>
                                <th style={{ textAlign: 'right' }}>SALES</th>
                                <th>CUSTOMER NAME</th>
                                <th>PAYMENT</th>
                                <th style={{ textAlign: 'center' }}>DISCOUNTED</th>
                                <th>SERVE BY</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flattenedTransactionsItems.length === 0 ? (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No transactions found for the selected date range.
                                    </td>
                                </tr>
                            ) : (
                                flattenedTransactionsItems.map((item, i) => {
                                    const tx = item.tx || {};
                                    const isDeduction = (tx.status === 'Refund' || tx.status === 'Return' || tx.status === 'Void');
                                    const isPending = tx.status === 'Pending';
                                    const amountColor = (isDeduction || isPending) ? 'var(--danger, #DC2626)' : 'var(--success, #16A34A)';
                                    const amountPrefix = isDeduction ? '- ' : '';
                                    const resolvedName = item.product?.name || item.name || 'Unknown Product';
                                    const resolvedPartNo = item.product?.part_no || item.partNo || 'N/A';
                                    const qty = Number(item.qty || 1);
                                    const unitPrice = Number(item.original_price || item.price || 0);
                                    const discountVal = getItemDiscountAmount(item, tx);
                                    const grossRowAmount = qty * unitPrice;
                                    const netRowAmount = Math.max(0, grossRowAmount - discountVal);
                                    const customerVal = tx.customer_name || tx.customer?.name || (tx.customer_id ? `Customer #${tx.customer_id}` : 'WALK-IN');
                                    const serveByVal = tx.cashier?.real_name || tx.cashier?.name || tx.checker?.name || '—';

                                    return (
                                        <tr key={`${tx.id}-${item.id || i}`}>
                                            <td style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(tx.date || tx.created_at)}</td>
                                            <td style={{ fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{tx.si_no || tx.receipt_number || '-'}</td>
                                            <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontWeight: '600' }}>{resolvedPartNo}</td>
                                            <td><span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{resolvedName}</span></td>
                                            <td style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{qty}</td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                                                {fmt(unitPrice)}
                                            </td>
                                            <td style={{ fontWeight: '700', textAlign: 'right', color: amountColor }}>{amountPrefix}{fmt(netRowAmount)}</td>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{customerVal}</td>
                                            <td style={{ fontWeight: tx.payment_method?.startsWith('P.O') ? '700' : '400', color: tx.payment_method?.startsWith('P.O') ? '#C00000' : 'var(--text-secondary)' }}>{tx.payment_method || 'CASH'}</td>
                                            <td style={{ textAlign: 'center', color: discountVal > 0 ? '#2563EB' : '#94A3B8', fontWeight: discountVal > 0 ? '700' : '400' }}>
                                                {discountVal > 0 ? `-${fmt(discountVal)}` : '—'}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{serveByVal.split(' ')[0]}</td>
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
                                    <td style={{ fontWeight: '800', padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>{totalQty}</td>
                                    <td></td>
                                    <td style={{ fontWeight: '800', padding: '16px', textAlign: 'right', color: 'var(--success, #16A34A)', fontSize: '15px' }}>{fmt(totalAmount)}</td>
                                    <td></td>
                                    <td></td>
                                    <td style={{ fontWeight: '800', padding: '16px', textAlign: 'center', color: '#2563EB', fontSize: '13px' }}>
                                        {totalDiscountAmount > 0 ? `-${fmt(totalDiscountAmount)}` : '—'}
                                    </td>
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
