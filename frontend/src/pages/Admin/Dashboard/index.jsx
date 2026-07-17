import React from 'react';
import { useDashboard } from './hooks/useDashboard';

import StatCards from './views/StatCards';
import SalesTrendChart from './views/SalesTrendChart';
import CriticalStockAlerts from './views/CriticalStockAlerts';
import TopSellingTable from './views/TopSellingTable';

export default function Dashboard() {
    const {
        name,
        loading,
        currentTimeRange,
        setCurrentTimeRange,
        stats,
        topProducts
    } = useDashboard();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{
                height: 70,
                backgroundColor: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 88px 0 32px',
                flexShrink: 0,
            }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px', margin: 0 }}>
                        Good morning, {name}
                    </h1>
                    <p style={{ color: '#64748B', fontSize: 13, marginTop: 2 }}>
                        You're signed in as <strong style={{ color: '#0F172A' }}>Admin</strong>. Here's your store at a glance.
                    </p>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                    {['Today', 'This Week', 'This Month', 'This Year'].map(range => (
                        <button
                            key={range}
                            onClick={() => setCurrentTimeRange(range)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: 9999,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                backgroundColor: currentTimeRange === range ? '#3B82F6' : '#FFFFFF',
                                color: currentTimeRange === range ? '#FFFFFF' : '#64748B',
                                border: currentTimeRange === range ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>Loading dashboard data...</div>
                ) : (
                    <>
                        <StatCards stats={stats} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                            <SalesTrendChart />
                            <CriticalStockAlerts />
                        </div>

                        <TopSellingTable topProducts={topProducts} />
                    </>
                )}
            </div>
        </div>
    );
}
