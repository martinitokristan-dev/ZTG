import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopSellingTable({ topProducts }) {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Top Selling Products</h3>
                <button
                    onClick={() => navigate('/reports')}
                    style={{ padding: '6px 16px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#64748B', backgroundColor: '#FFFFFF', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                    View Full Reports
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                            {['Rank', 'Product', 'Part Number', 'Category', 'Units Sold', 'Revenue', 'Sales Performance'].map(h => (
                                <th key={h} style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B', fontWeight: 700, padding: '14px 16px', textAlign: 'left' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {topProducts.map((p) => (
                            <tr key={p.rank} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#64748B' }}>{p.rank}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{p.name}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{p.partNo}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B' }}>{p.category}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#0F172A', fontWeight: 600 }}>{p.unitsSold}</td>
                                <td style={{ padding: '14px 16px', fontSize: 13, color: '#0F172A', fontWeight: 600 }}>₱{p.revenue.toLocaleString()}</td>
                                <td style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 200 }}>
                                        <div style={{ flex: 1, height: 6, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ width: `${p.percentage}%`, height: '100%', backgroundColor: '#3B82F6', borderRadius: 4, transition: 'width 0.4s ease' }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', minWidth: '32px', textAlign: 'right' }}>
                                            {p.percentage}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
