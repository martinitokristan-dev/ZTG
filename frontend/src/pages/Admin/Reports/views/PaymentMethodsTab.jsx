import React from 'react';

export default function PaymentMethodsTab({ salesSummary, fmt, startDate, setStartDate, endDate, setEndDate }) {
    const methods = salesSummary?.revenue_by_payment || [];
    const totalRev = salesSummary?.total_revenue || 0;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
                </div>
                <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'none', stroke: '#fff', strokeWidth: '2.5' }}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Export CSV
                </button>
            </div>

            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {methods.map((m, i) => (
                    <div key={i} className="kpi-card" style={i === 0 ? { borderTop: '4px solid #10B981' } : {}}>
                        <div className="kpi-label">{m.name}</div>
                        <div className="kpi-value">{fmt(m.amount)}</div>
                        <div className="kpi-trend neutral">{m.count} {m.count === 1 ? 'transaction' : 'transactions'}</div>
                    </div>
                ))}
            </div>

            <div className="section-card">
                <div className="section-card-header">Payment Methods Breakdown</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>PAYMENT METHOD</th>
                                <th>TRANSACTIONS</th>
                                <th>TOTAL AMOUNT</th>
                                <th>% OF TOTAL SALES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No payment methods found for the selected date range.</td></tr>
                            ) : methods.map((m, i) => {
                                const percentage = totalRev > 0 ? ((m.amount / totalRev) * 100).toFixed(1) : 0;
                                return (
                                    <tr key={i}>
                                        <td>
                                            <strong>{m.name}</strong>
                                            {i === 0 && m.amount > 0 && <span className="badge badge-success" style={{ marginLeft: '8px' }}>Top</span>}
                                        </td>
                                        <td>{m.count}</td>
                                        <td style={{ fontWeight: '700' }}>{fmt(m.amount)}</td>
                                        <td>{percentage}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#F8FAFC', fontWeight: '700', borderTop: '2px solid var(--border)' }}>
                                <td style={{ padding: '14px 16px' }}>TOTAL</td>
                                <td style={{ padding: '14px 16px' }}>{methods.reduce((sum, m) => sum + m.count, 0)}</td>
                                <td style={{ padding: '14px 16px' }}>{fmt(methods.reduce((sum, m) => sum + m.amount, 0))}</td>
                                <td style={{ padding: '14px 16px' }}>{totalRev > 0 ? '100%' : '—'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
