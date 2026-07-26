import React from 'react';

export default function StatCards({ stats, currentTimeRange = 'Today' }) {
    return (
        <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {/* Card 1: Total Items */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Items</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{(stats.totalStock || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ Total stock units
                </div>
            </div>

            {/* Card 2: Revenue */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {currentTimeRange === 'Today' ? "Today's Revenue" : `${currentTimeRange}'s Revenue`}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>₱{(stats.todayRevenue || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ Real-time sales total
                </div>
            </div>

            {/* Card 3: Products & Variants */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A', marginTop: 8 }}>{(stats.productCount || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ▲ {(stats.variantCount || 0).toLocaleString()} Total Variants / SKUs
                </div>
            </div>

            {/* Card 4: Top Product */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Product</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={stats.topProduct?.name || '-'}>
                    {stats.topProduct?.name || '-'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981', marginTop: 8 }}>
                    {stats.topProduct?.qty || 0} units sold
                </div>
            </div>
        </div>
    );
}
