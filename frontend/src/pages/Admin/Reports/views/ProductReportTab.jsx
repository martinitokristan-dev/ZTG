import React from 'react';

export default function ProductReportTab({ productPerformance, refundVoidAnalysis }) {
    const { top_sellers = [], dead_stock = [] } = productPerformance || {};
    
    const refundsCount = refundVoidAnalysis?.total_refunds || 0;
    const damagedCount = 0; // Backend endpoint might need expanding for damaged items if needed

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Date Range:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="date" className="form-control form-control-sm" style={{ width: '150px' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
                        <input type="date" className="form-control form-control-sm" style={{ width: '150px' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '12px' }}>Category:</span>
                    <select className="form-control form-control-sm" style={{ width: '180px' }}>
                        <option value="All">All Categories</option>
                    </select>
                </div>
                <button className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <svg viewBox="0 0 24 24" style={{ width: '15px', height: '15px', fill: 'none', stroke: '#fff', strokeWidth: '2.5' }}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Export CSV
                </button>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Total Damaged Items</div>
                    <div className="kpi-value">{damagedCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Returns</div>
                    <div className="kpi-value">{refundsCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Refunds</div>
                    <div className="kpi-value">{refundsCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Dead Stock Count</div>
                    <div className="kpi-value">{dead_stock.length}</div>
                </div>
            </div>

            <div className="section-card">
                <div className="section-card-header">Product Movement</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>PART NO.</th>
                                <th>PRODUCT NAME</th>
                                <th>CATEGORY</th>
                                <th>QTY SOLD</th>
                                <th>RETURNS</th>
                                <th>REFUNDS</th>
                                <th>DAMAGED</th>
                                <th>CURRENT STOCK</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top_sellers.slice(0, 10).map((p, i) => (
                                <tr key={i}>
                                    <td>{p.part_no || 'N/A'}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category || 'Uncategorized'}</td>
                                    <td>{p.sales_count}</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>0</td>
                                    <td>{p.stock}</td>
                                    <td>{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {dead_stock.length > 0 && (
                <div className="section-card">
                    <div className="section-card-header" style={{ color: '#DC2626' }}>Dead Stock (No Sales)</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>PART NO.</th>
                                    <th>PRODUCT NAME</th>
                                    <th>CATEGORY</th>
                                    <th>CURRENT STOCK</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dead_stock.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.part_no || 'N/A'}</td>
                                        <td>{p.name}</td>
                                        <td>{p.category || 'Uncategorized'}</td>
                                        <td>{p.stock}</td>
                                        <td><span style={{ color: '#DC2626', fontWeight: '600' }}>Dead Stock</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
