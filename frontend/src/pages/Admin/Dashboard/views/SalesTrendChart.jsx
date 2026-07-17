import React from 'react';

export default function SalesTrendChart({ last7Days = [] }) {
    // If no data is available or loading, show an empty state or fallback to default labels
    const hasData = last7Days && last7Days.length === 7;
    const chartDays = hasData ? last7Days.map(d => d.day) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    let dateRangeStr = '';
    if (hasData) {
        const first = new Date(last7Days[0].date);
        const last = new Date(last7Days[6].date);
        const formatOptions = { month: 'short', day: 'numeric' };
        dateRangeStr = `${first.toLocaleDateString('en-US', formatOptions)} - ${last.toLocaleDateString('en-US', formatOptions)}`;
    }

    // Chart dimensions
    const width = 600;
    const height = 200;
    const paddingY = 20; // top and bottom padding for the line
    const startX = 40;
    const endX = 520;

    // Calculate SVG coordinates based on revenue
    let points = [];
    if (hasData) {
        const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 100); // minimum scale of 100 to avoid flatline at bottom if all 0
        const stepX = (endX - startX) / 6;

        points = last7Days.map((d, index) => {
            const cx = startX + (index * stepX);
            // Invert Y axis: 0 is at bottom (height - paddingY), maxRevenue is at top (paddingY)
            const cy = (height - paddingY) - ((d.revenue / maxRevenue) * (height - 2 * paddingY));
            return [cx, cy];
        });
    } else {
        // Fallback hardcoded points for preview state
        points = [[40,150],[120,130],[200,165],[280,105],[360,125],[440,88],[520,80]];
    }

    const polylineStr = points.map(([x, y]) => `${x},${y}`).join(' ');

    return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Sales Trend — Last 7 Days</h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{dateRangeStr || 'Jun 8 - Jun 14'}</span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <line x1="0" y1="50" x2={width} y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2={width} y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2={width} y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                    <polyline fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={polylineStr} />
                    {points.map(([cx,cy], i) => (
                        <circle key={i} cx={cx} cy={cy} r="5" fill="#3B82F6" stroke="#ffffff" strokeWidth="2.5" />
                    ))}
                </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', }}>
                {chartDays.map((day, idx) => (
                    <span key={idx} style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{day}</span>
                ))}
            </div>
        </div>
    );
}
