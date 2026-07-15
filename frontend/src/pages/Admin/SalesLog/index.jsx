import React from 'react';
import useSalesLog from './hooks/useSalesLog';
import SalesTable from './views/SalesTable';

export default function SalesLog() {
    const sl = useSalesLog();

    return (
        <div className="main-workspace">
            <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '20px', marginBottom: '2px', fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>Sales Log</h1>
                    <div className="page-description" style={{ marginTop: '0', fontSize: '12px', color: 'var(--text-secondary)' }}>Master administrative record of all sales, returns, and POS activity.</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn" style={{ background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '12px', padding: '8px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Export CSV
                    </button>
                </div>
            </div>

                <div className="content-body" style={{ padding: '20px 24px', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 120px)' }}>
                    
                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3B82F6', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Transactions</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.metrics.totalTx}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10B981', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Sales (Filtered)</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.fmt(sl.metrics.totalSales)}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #F59E0B', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px' }}>Total Refunds / Returns</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: '"Outfit", sans-serif' }}>{sl.fmt(sl.metrics.totalRefunds)}</div>
                        </div>
                        <div className="card" style={{ padding: '20px', borderLeft: '4px solid #8B5CF6', background: '#FFFFFF', borderRadius: '10px', border: '1px solid var(--border)' }}>
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

                    <SalesTable items={sl.filteredItems} loading={sl.loading} fmt={sl.fmt} fmtDate={sl.fmtDate} />

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
