import React from 'react';

export default function CustomerDirectoryTable({ loading, customers, fmtDate }) {
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#64748B' }}>Loading customer directory...</div>;
    }

    if (customers.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                No customers found matching the search criteria.
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    <tr>
                        <th style={{ padding: '12px 24px', fontWeight: '700' }}>Full Name</th>
                        <th style={{ padding: '12px 24px', fontWeight: '700' }}>Contact Number</th>
                        <th style={{ padding: '12px 24px', fontWeight: '700', textAlign: 'center' }}>Total Purchases</th>
                        <th style={{ padding: '12px 24px', fontWeight: '700' }}>First Purchase Date</th>
                        <th style={{ padding: '12px 24px', fontWeight: '700' }}>Last Purchase Date</th>
                    </tr>
                </thead>
                <tbody style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {customers.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px 24px', fontWeight: '600' }}>{c.name}</td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{c.contact || c.contact_number || 'N/A'}</td>
                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                    {(c.tx_count !== undefined ? c.tx_count : (c.total_purchases || c.totalPurchases || 0))} items
                                </span>
                            </td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{fmtDate(c.first_purchase_date || c.firstDate)}</td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{fmtDate(c.last_purchase_date || c.lastDate || c.last_transaction)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
