import React from 'react';

export default function AlertsTab({
    activeAlertsSubTab, setActiveAlertsSubTab, settings, handleSettingInputChange, handleToggleSetting,
    alertRules, setShowRuleModal, handleToggleRule, handleDeleteRule, handleSaveBulkSettings
}) {
    return (
        <div className="prod-tabs-layout">
            <div className="prod-vtab-sidebar">
                {[
                    { id: 'inventory', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>, label: 'Inventory Alerts' },
                    { id: 'transaction', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>, label: 'Transaction Alerts' },
                    { id: 'reservation', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>, label: 'Reservation Alerts' },
                    { id: 'email', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>, label: 'Reports' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveAlertsSubTab(tab.id)}
                        className={`prod-vtab-btn ${activeAlertsSubTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="prod-panel-content" style={{ flex: 1, padding: '24px 32px' }}>
                    {/* PANEL: Inventory Alerts */}
                    {activeAlertsSubTab === 'inventory' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ width: '18px', height: '18px' }}><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px' }}>Inventory Alerts</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Get notified about stock levels, damaged goods, and dashboard visibility.</p>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px' }}>
                                <label className="toggle-row" style={{ margin: 0, border: 'none', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', flex: 1 }}>Enable stock alerts (low-stock & out-of-stock)</span>
                                    <input type="checkbox" checked={settings.enable_stock_alerts_checkbox === 'true'} onChange={(e) => handleSettingInputChange('enable_stock_alerts_checkbox', e.target.checked ? 'true' : 'false')} />
                                </label>
                            </div>

                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts for low stock items</span>
                                    <input type="checkbox" checked={settings.send_low_stock_alerts === 'true'} onChange={() => handleToggleSetting('send_low_stock_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts for out-of-stock items</span>
                                    <input type="checkbox" checked={settings.send_oos_alerts === 'true'} onChange={() => handleToggleSetting('send_oos_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts for dead stock (no sales in 90+ days)</span>
                                    <input type="checkbox" checked={settings.send_dead_stock_alerts === 'true'} onChange={() => handleToggleSetting('send_dead_stock_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts when damaged items are recorded</span>
                                    <input type="checkbox" checked={settings.send_damaged_alerts === 'true'} onChange={() => handleToggleSetting('send_damaged_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Show inventory alerts on admin dashboard</span>
                                    <input type="checkbox" checked={settings.show_alerts_on_dashboard === 'true'} onChange={() => handleToggleSetting('show_alerts_on_dashboard')} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* PANEL: Transaction Alerts */}
                    {activeAlertsSubTab === 'transaction' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" style={{ width: '18px', height: '18px' }}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px' }}>Transaction Alerts</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Notifications for purchase orders, refunds, and large sales events.</p>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts when refunds are processed</span>
                                    <input type="checkbox" checked={settings.send_refund_alerts === 'true'} onChange={() => handleToggleSetting('send_refund_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts when returns are processed</span>
                                    <input type="checkbox" checked={settings.send_return_alerts === 'true'} onChange={() => handleToggleSetting('send_return_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts when transactions are voided</span>
                                    <input type="checkbox" checked={settings.send_void_transaction_alerts === 'true'} onChange={() => handleToggleSetting('send_void_transaction_alerts')} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* PANEL: Reservation Alerts */}
                    {activeAlertsSubTab === 'reservation' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" style={{ width: '18px', height: '18px' }}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px' }}>Reservation Alerts</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Stay informed about upcoming and expired reservations.</p>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts for reservations expiring soon (24 hours before)</span>
                                    <input type="checkbox" checked={settings.send_reservation_expiring_alerts === 'true'} onChange={() => handleToggleSetting('send_reservation_expiring_alerts')} />
                                </label>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Send alerts when reservations expire</span>
                                    <input type="checkbox" checked={settings.send_reservation_expired_alerts === 'true'} onChange={() => handleToggleSetting('send_reservation_expired_alerts')} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* PANEL: Reports */}
                    {activeAlertsSubTab === 'email' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ width: '18px', height: '18px' }}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px' }}>Reports</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Configure automated report reminders.</p>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                    <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Remind admin to report the daily sales at 4:30 PM and 5:00 PM (Mon-Sat)</span>
                                    <input type="checkbox" checked={settings.remind_daily_sales_report === 'true'} onChange={() => handleToggleSetting('remind_daily_sales_report')} />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

