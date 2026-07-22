import React from 'react';
import useSalesLog from './hooks/useSalesLog';
import SalesTable from './views/SalesTable';
import { exportSalesToExcel } from '../../../shared/utils/clientExcelExporter';

export default function SalesLog() {
    const sl = useSalesLog();

    const handleExportExcel = () => {
        const flattened = (sl.filteredItems || []).map(item => ({
            qty: item.qty,
            price: item.price,
            name: item.name,
            partNo: item.part_no || item.partNo,
            tx: {
                date: item._txDate,
                si_no: item._txReceipt,
                customer_name: item._txCustomer,
                payment_method: item._txPayment,
                status: item._txStatus,
                cashier: { name: item._txChecker }
            }
        }));
        exportSalesToExcel(flattened, { filename: `Master_Sales_Log_${sl.timeFilter.replace(/\s+/g, '_')}.xlsx` });
    };

    return (
        <div className="main-workspace">
            <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '20px', marginBottom: '2px', fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>Sales Log</h1>
                    <div className="page-description" style={{ marginTop: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>Master administrative record of all sales, returns, and POS activity.</div>
                </div>
                <button 
                    className="btn btn-success"
                    onClick={handleExportExcel}
                    disabled={!sl.filteredItems || sl.filteredItems.length === 0}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '13px', 
                        borderRadius: '8px', padding: '8px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                        border: 'none', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                        cursor: (!sl.filteredItems || sl.filteredItems.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                    title="Export formatted Master Sales Log Excel sheet"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    Export Excel (.xlsx)
                </button>
            </div>

                <div className="content-body" style={{ padding: '20px 24px', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 120px)' }}>
                    
                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div className="card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Transactions</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.metrics.totalTx}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Sales (Filtered)</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.fmt(sl.metrics.totalSales)}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Refunds / Returns</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.fmt(sl.metrics.totalRefunds)}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Average Sale</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.fmt(sl.metrics.avgSale)}</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ marginBottom: '16px' }}>
                        <div className="table-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                                <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    placeholder="Search by receipt #, customer, or cashier..." 
                                    style={{ paddingLeft: '44px' }} 
                                    value={sl.searchQuery}
                                    onChange={(e) => sl.setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div style={{ width: '150px' }}>
                                <select className="form-control form-control-sm" value={sl.timeFilter} onChange={(e) => sl.setTimeFilter(e.target.value)}>
                                    <option value="Today">Today</option>
                                    <option value="All">All Time</option>
                                    <option value="This Week">This Week</option>
                                    <option value="This Month">This Month</option>
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <select className="form-control form-control-sm" value={sl.cashierFilter} onChange={(e) => sl.setCashierFilter(e.target.value)}>
                                    <option value="All">All Cashiers</option>
                                    {sl.cashiers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <select className="form-control form-control-sm" value={sl.paymentFilter} onChange={(e) => sl.setPaymentFilter(e.target.value)}>
                                    <option value="All">All Payments</option>
                                    <option value="Cash">Cash</option>
                                    <option value="GCash">GCash</option>
                                    <option value="Bank">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="P.O. (Pending)">P.O. (Pending)</option>
                                </select>
                            </div>
                            <div style={{ width: '150px' }}>
                                <select className="form-control form-control-sm" value={sl.sortFilter} onChange={(e) => sl.setSortFilter(e.target.value)}>
                                    <option value="Transaction #">Transaction #</option>
                                    <option value="Date (Newest)">Date (Newest)</option>
                                    <option value="Date (Oldest)">Date (Oldest)</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            {['All', 'Completed', 'Refund', 'Pending'].map(tab => (
                                <button 
                                    key={tab}
                                    className={`status-tab ${sl.activeTab === tab ? 'active' : ''}`}
                                    onClick={() => sl.setActiveTab(tab)}
                                    style={{
                                        padding: '8px 16px', border: '1px solid var(--border)', borderRadius: '20px', 
                                        background: sl.activeTab === tab ? 'var(--primary)' : '#fff',
                                        color: sl.activeTab === tab ? '#fff' : 'var(--text-secondary)',
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <SalesTable 
                        items={sl.filteredItems} 
                        loading={sl.loading} 
                        fmt={sl.fmt} 
                        fmtDate={sl.fmtDate} 
                    />

                    {/* Pagination Controls */}
                    {sl.pagination.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', background: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                Showing page {sl.pagination.current_page} of {sl.pagination.last_page} ({sl.pagination.total} total records)
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className="btn btn-sm" 
                                    style={{ border: '1px solid var(--border)', background: '#fff' }}
                                    disabled={sl.page <= 1}
                                    onClick={() => sl.setPage(sl.page - 1)}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="btn btn-sm" 
                                    style={{ border: '1px solid var(--border)', background: '#fff' }}
                                    disabled={sl.page >= sl.pagination.last_page}
                                    onClick={() => sl.setPage(sl.page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

            </div>
        </div>
    );
}
