import React, { useState } from 'react';

export default function SalesTrendChart({ last7Days = [], timeRange = 'Today' }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const hasData = last7Days && last7Days.length > 0;
    const numPoints = hasData ? last7Days.length : 7;
    
    // Dynamic Date Range string
    let dateRangeStr = '';
    const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (hasData) {
        if (timeRange === 'Today') {
            dateRangeStr = new Date().toLocaleDateString('en-US', formatOptions);
        } else if (timeRange === 'This Month') {
            dateRangeStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (timeRange === 'This Year') {
            dateRangeStr = new Date().toLocaleDateString('en-US', { year: 'numeric' });
        } else {
            const first = new Date(last7Days[0].date);
            const last = new Date(last7Days[last7Days.length - 1].date);
            dateRangeStr = `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }

    // Chart dimensions
    const width = 600;
    const height = 220;
    const paddingY = 24;
    const startX = 0;
    const endX = width;

    // Calculate SVG coordinates based on revenue
    let points = [];
    const maxRevenue = hasData ? Math.max(...last7Days.map(d => d.revenue), 100) : 100;
    const stepX = numPoints > 1 ? (endX - startX) / (numPoints - 1) : (endX - startX);

    if (hasData) {
        points = last7Days.map((d, index) => {
            const cx = startX + (index * stepX);
            const cy = (height - paddingY) - ((d.revenue / maxRevenue) * (height - 2 * paddingY));
            return { x: cx, y: cy, label: d.day, revenue: d.revenue, date: d.date };
        });
    } else {
        // Fallback preview
        const dummy = [20, 40, 15, 60, 30, 85, 45];
        points = dummy.map((val, index) => {
            const cx = startX + (index * stepX);
            const cy = (height - paddingY) - ((val / 100) * (height - 2 * paddingY));
            return { x: cx, y: cy, label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index], revenue: val * 100, date: '' };
        });
    }

    // Helper to generate a smooth Catmull-Rom spline path
    const getBezierCurvePath = (pts) => {
        if (!pts || pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
        if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;
        
        let path = `M ${pts[0].x} ${pts[0].y}`;
        const clampY = (y) => Math.max(paddingY, Math.min(height - paddingY, y));
        
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? 0 : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2 === pts.length ? i + 1 : i + 2];
            
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = clampY(p1.y + (p2.y - p0.y) / 6);
            
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = clampY(p2.y - (p3.y - p1.y) / 6);
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return path;
    };

    // Smooth spline paths
    const linePath = getBezierCurvePath(points);
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return (
        <div style={{ 
            backgroundColor: '#FFFFFF', 
            border: '1px solid #E2E8F0', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px 0 rgba(0,0,0,0.06)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    Sales Trend — {timeRange}
                </h3>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>{dateRangeStr}</span>
            </div>

            <div style={{ width: '100%', height: height, position: 'relative' }}>
                <svg 
                    width="100%" 
                    height="100%" 
                    viewBox={`0 0 ${width} ${height}`} 
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.00" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1={0} y1={paddingY} x2={width} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={0} y1={(height - 2 * paddingY) / 2 + paddingY} x2={width} y2={(height - 2 * paddingY) / 2 + paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={0} y1={height - paddingY} x2={width} y2={height - paddingY} stroke="#E2E8F0" strokeWidth="1.5" />

                    {/* Filled Area */}
                    <path d={areaPath} fill="url(#chartAreaGradient)" />

                    {/* Polyline path */}
                    <path d={linePath} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Hover vertical guide line */}
                    {hoveredIndex !== null && points[hoveredIndex] && (
                        <line 
                            x1={points[hoveredIndex].x} 
                            y1={paddingY} 
                            x2={points[hoveredIndex].x} 
                            y2={height - paddingY} 
                            stroke="#3B82F6" 
                            strokeWidth="1.5" 
                            strokeDasharray="4 4" 
                        />
                    )}

                    {/* Plot Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle 
                                cx={p.x} 
                                cy={p.y} 
                                r={hoveredIndex === i ? "6" : "0"} 
                                fill="#2563EB" 
                                stroke="#FFFFFF" 
                                strokeWidth="3"
                                style={{ transition: 'r 0.1s ease' }}
                            />
                            {/* Transparent overlay column for easier hover triggering */}
                            <rect
                                x={p.x - stepX / 2}
                                y={paddingY}
                                width={stepX}
                                height={height - 2 * paddingY}
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        </g>
                    ))}
                </svg>

                {/* Interactive Tooltip popup positioned via percentage left */}
                {hoveredIndex !== null && points[hoveredIndex] && (() => {
                    const pctX = (points[hoveredIndex].x / width) * 100;
                    const alignRight = pctX > 75;
                    return (
                        <div style={{
                            position: 'absolute',
                            left: `${pctX}%`,
                            top: points[hoveredIndex].y - 50,
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            padding: '8px 12px',
                            borderRadius: 8,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                            zIndex: 10,
                            pointerEvents: 'none',
                            fontFamily: 'Inter, sans-serif',
                            transform: alignRight ? 'translateX(-100%) translateX(-8px)' : 'translateX(8px)',
                            whiteSpace: 'nowrap'
                        }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>
                                {points[hoveredIndex].label}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                                ₱{points[hoveredIndex].revenue.toLocaleString()}
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Fluid HTML Labels Row below the SVG */}
            <div style={{ position: 'relative', width: '100%', height: 20, marginTop: 12 }}>
                {points.map((p, idx) => {
                    let showLabel = false;
                    if (timeRange === 'Today') {
                        showLabel = idx % 4 === 0;
                    } else if (timeRange === 'This Month') {
                        showLabel = idx === 0 || idx === 9 || idx === 19 || idx === numPoints - 1;
                    } else if (timeRange === 'This Year') {
                        showLabel = idx % 2 === 0;
                    } else {
                        showLabel = true;
                    }

                    if (!showLabel) return null;

                    const pctX = (p.x / width) * 100;
                    let transformStr = 'translateX(-50%)';
                    if (idx === 0) transformStr = 'translateX(0)';
                    if (idx === numPoints - 1) transformStr = 'translateX(-100%)';

                    return (
                        <span 
                            key={idx} 
                            style={{ 
                                position: 'absolute',
                                left: `${pctX}%`,
                                transform: transformStr,
                                fontSize: 11, 
                                color: '#64748B', 
                                fontWeight: 600,
                                fontFamily: 'Inter, sans-serif',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {p.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
