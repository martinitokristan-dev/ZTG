import React from 'react';

export default function SalesTrendChart() {
    const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Sales Trend — Last 7 Days</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>Jun 8 - Jun 14</span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
                <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <polyline fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        points="40,150 120,130 200,165 280,105 360,125 440,88 520,80" />
                    {[[40,150],[120,130],[200,165],[280,105],[360,125],[440,88],[520,80]].map(([cx,cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="5" fill="#3B82F6" stroke="#ffffff" strokeWidth="2.5" />
                    ))}
                </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', }}>
                {chartDays.map(day => (
                    <span key={day} style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{day}</span>
                ))}
            </div>
        </div>
    );
}
