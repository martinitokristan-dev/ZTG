import React from 'react';

export default function CustomerLeaderboard({ customerLog, fmt, fmtDate }) {
    if (!customerLog || customerLog.length === 0) return null;

    return (
        <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>Customer Leaderboard</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Highest total purchase value</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F8FAFC', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        <tr>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Rank</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Customer</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'center' }}>Total Transactions</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600' }}>Last Purchase</th>
                            <th style={{ padding: '12px 20px', fontWeight: '600', textAlign: 'right' }}>Lifetime Value</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px' }}>
                        {customerLog.slice(0, 10).map((c, i) => (
                            <tr key={c.customer_id} style={{ borderBottom: i === Math.min(customerLog.length, 10) - 1 ? 'none' : '1px solid var(--border)' }}>
                                <td style={{ padding: '12px 20px', fontWeight: '700', color: i < 3 ? 'var(--primary)' : 'var(--text-secondary)' }}>
                                    #{i + 1}
                                </td>
                                <td style={{ padding: '12px 20px' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>{c.phone || 'No phone'}</div>
                                </td>
                                <td style={{ padding: '12px 20px', textAlign: 'center', fontWeight: '600' }}>{c.tx_count}</td>
                                <td style={{ padding: '12px 20px', color: '#64748B' }}>{fmtDate(c.last_transaction)}</td>
                                <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>{fmt(c.total_spent)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
