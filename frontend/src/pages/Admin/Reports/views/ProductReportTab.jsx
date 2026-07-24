import React, { useState, useMemo } from 'react';
import IOSDatePicker from '../../../../shared/components/IOSDatePicker';
import IOSSelect from '../../../../shared/components/IOSSelect';

export default function ProductReportTab({ productPerformance, refundVoidAnalysis, startDate, setStartDate, endDate, setEndDate }) {
    const { top_sellers = [], dead_stock = [], totals = {} } = productPerformance || {};
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Extract unique categories from top sellers and dead stock
    const categoryOptions = useMemo(() => {
        const set = new Set();
        top_sellers.forEach(p => {
            if (p.category) set.add(p.category);
        });
        dead_stock.forEach(p => {
            if (p.category) set.add(p.category);
        });
        return Array.from(set);
    }, [top_sellers, dead_stock]);

    // Filter top sellers and dead stock by selected Category
    const filteredTopSellers = useMemo(() => {
        if (selectedCategory === 'All') return top_sellers;
        return top_sellers.filter(p => (p.category || 'Uncategorized') === selectedCategory);
    }, [top_sellers, selectedCategory]);

    const filteredDeadStock = useMemo(() => {
        if (selectedCategory === 'All') return dead_stock;
        return dead_stock.filter(p => (p.category || 'Uncategorized') === selectedCategory);
    }, [dead_stock, selectedCategory]);

    const returnsCount = totals.returns_qty || 0;
    const refundsCount = totals.refunds_qty || 0;
    const damagedCount = totals.damaged_qty || 0;

    const handleExportCSV = () => {
        if (filteredTopSellers.length === 0 && filteredDeadStock.length === 0) return;

        const headers = ["Part No.", "Product Name", "Category", "Qty Sold", "Returns", "Refunds", "Damaged", "Current Stock", "Status"];
        const rows = [headers.join(",")];

        filteredTopSellers.forEach(p => {
            const status = p.stock > 0 ? "In Stock" : "Out of Stock";
            rows.push([
                `"${p.part_no || 'N/A'}"`,
                `"${(p.name || '').replace(/"/g, '""')}"`,
                `"${p.category || 'Uncategorized'}"`,
                p.sales_count || 0,
                p.returns_count || 0,
                p.refunds_count || 0,
                p.damaged_count || 0,
                p.stock || 0,
                `"${status}"`
            ].join(","));
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Product_Performance_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div className="table-filters" style={{ padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Date Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IOSDatePicker value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="Start Date" style={{ width: '140px' }} />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
                        <IOSDatePicker value={endDate} onChange={e => setEndDate(e.target.value)} placeholder="End Date" style={{ width: '140px' }} alignRight={true} />
                    </div>
                    <div style={{ width: '180px' }}>
                        <IOSSelect
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            options={[{ value: 'All', label: 'All Categories' }, ...categoryOptions.map(cat => ({ value: cat, label: cat }))]}
                        />
                    </div>
                </div>
                <button 
                    className="btn btn-success" 
                    onClick={handleExportCSV}
                    disabled={filteredTopSellers.length === 0 && filteredDeadStock.length === 0}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                >
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
                    <div className="kpi-value">{returnsCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Refunds</div>
                    <div className="kpi-value">{refundsCount}</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Dead Stock Count</div>
                    <div className="kpi-value">{filteredDeadStock.length}</div>
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
                            {filteredTopSellers.length === 0 ? (
                                <tr><td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No product movement for the selected date range.</td></tr>
                            ) : filteredTopSellers.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.part_no || 'N/A'}</td>
                                    <td>{p.name}</td>
                                    <td>{p.category || 'Uncategorized'}</td>
                                    <td>{p.sales_count}</td>
                                    <td>{p.returns_count || 0}</td>
                                    <td>{p.refunds_count || 0}</td>
                                    <td>{p.damaged_count || 0}</td>
                                    <td>{p.stock}</td>
                                    <td>{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredDeadStock.length > 0 && (
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
                                {filteredDeadStock.map((p, i) => (
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
