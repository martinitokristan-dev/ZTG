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
                    { id: 'email', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>, label: 'Reports' },
                    { id: 'rules', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><path d="M13 12H9m4 4H9m4-8H9"/></svg>, label: 'Active Alert Rules' }
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
                <div style={{ flex: 1, padding: '24px 32px' }}>
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

                    {/* PANEL: Active Alert Rules */}
                    {activeAlertsSubTab === 'rules' && (
                        <div className="prod-vtab-panel active">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ width: '18px', height: '18px' }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4m0 4h.01"/></svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px' }}>Active Alert Rules</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Define custom rules with specific trigger conditions and recipients.</p>
                                </div>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>

                            <div style={{ overflowX: 'auto', marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alert Type</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Trigger Condition</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Recipients</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alertRules.length === 0 ? (
                                            <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>No alert rules registered.</td></tr>
                                        ) : (
                                            alertRules.map(rule => (
                                                <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{rule.event_type === 'low_stock' ? 'Inventory - Low Stock' : rule.event_type === 'out_of_stock' ? 'Inventory - Out of Stock' : rule.name}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>{rule.event_type === 'low_stock' ? `Below ${rule.threshold} units` : 'Out of stock condition'}</td>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>admin@heavypartspro.com</td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', background: rule.is_active ? '#ecfdf5' : '#f1f5f9', color: rule.is_active ? '#059669' : '#64748b', border: `1px solid ${rule.is_active ? '#6ee7b7' : '#cbd5e1'}` }}>
                                                            {rule.is_active ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <button className="btn btn-secondary btn-sm" style={{ marginRight: '8px' }} onClick={() => handleToggleRule(rule)}>Toggle</button>
                                                        <button className="btn btn-danger btn-sm" style={{ background: 'transparent', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteRule(rule)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" className="btn btn-primary" onClick={() => setShowRuleModal(true)}>+ Add New Alert Rule</button>
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
}

