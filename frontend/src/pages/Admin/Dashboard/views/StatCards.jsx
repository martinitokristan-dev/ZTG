import React from 'react';

export default function StatCards({ stats }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {/* Card 1 */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{stats.totalStock}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ Stock items on hand
                </div>
            </div>

            {/* Card 2 */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today's Revenue</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>₱{stats.todayRevenue.toLocaleString()}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ Real-time sales total
                </div>
            </div>

            {/* Card 3 */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employees</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{stats.employeeCount}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginTop: 8 }}>
                    Active store workers
                </div>
            </div>

            {/* Card 4 */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Product</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={stats.topProduct.name}>
                    {stats.topProduct.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8 }}>
                    {stats.topProduct.qty} units sold
                </div>
            </div>
        </div>
    );
}
