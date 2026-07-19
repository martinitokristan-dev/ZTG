import React from 'react';

export default function GeneralTab({ settings, handleSettingInputChange, handleToggleSetting, handleSaveBulkSettings }) {
    return (
        <div className="card" style={{ marginBottom: '16px', paddingBottom: '80px' }}>
            <div className="settings-section">
                <h3 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    General Settings
                </h3>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="businessName">Business Name</label>
                        <input 
                            type="text" 
                            id="businessName" 
                            className="form-control" 
                            value={settings.business_name || ''} 
                            onChange={(e) => handleSettingInputChange('business_name', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="branchLocation">Branch Location</label>
                        <input 
                            type="text" 
                            id="branchLocation" 
                            className="form-control" 
                            value={settings.branch_location || ''} 
                            onChange={(e) => handleSettingInputChange('branch_location', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="contactNumber">Contact Number</label>
                        <input 
                            type="text" 
                            id="contactNumber" 
                            className="form-control" 
                            value={settings.contact_number || ''} 
                            onChange={(e) => handleSettingInputChange('contact_number', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="emailAddress">Email Address</label>
                        <input 
                            type="email" 
                            id="emailAddress" 
                            className="form-control" 
                            value={settings.email_address || ''} 
                            onChange={(e) => handleSettingInputChange('email_address', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="taxRate">Tax Rate (%)</label>
                        <input 
                            type="number" 
                            id="taxRate" 
                            className="form-control" 
                            value={settings.tax_rate || ''} 
                            onChange={(e) => handleSettingInputChange('tax_rate', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="currency">Currency</label>
                        <input 
                            type="text" 
                            id="currency" 
                            className="form-control" 
                            value={settings.currency || ''} 
                            onChange={(e) => handleSettingInputChange('currency', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Inventory Configuration
                </h3>
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="deadStockPeriod">Dead Stock Threshold (days with no sales)</label>
                        <select 
                            id="deadStockPeriod" 
                            className="form-control" 
                            value={settings.dead_stock_period || '30'} 
                            onChange={(e) => handleSettingInputChange('dead_stock_period', e.target.value)}
                            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', width: '100%', outline: 'none' }}
                        >
                            <option value="15">15 Days</option>
                            <option value="30">30 Days (Default)</option>
                            <option value="60">60 Days</option>
                            <option value="90">90 Days</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="dailyVoidLimit">Daily Void/Refund Limit</label>
                        <input 
                            type="number" 
                            id="dailyVoidLimit" 
                            className="form-control" 
                            value={settings.daily_void_limit || ''} 
                            onChange={(e) => handleSettingInputChange('daily_void_limit', e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: '16px' }}>
                    <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Automatically deduct stock after completed sales
                        </span>
                        <input 
                            type="checkbox" 
                            checked={settings.auto_deduct_stock === 'true'}
                            onChange={() => handleToggleSetting('auto_deduct_stock')}
                           
                        />
                    </label>
                    <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px 0' }}>
                        <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Track damaged products counts separately
                        </span>
                        <input 
                            type="checkbox" 
                            checked={settings.track_damaged_separately === 'true'}
                            onChange={() => handleToggleSetting('track_damaged_separately')}
                           
                        />
                    </label>
                </div>
            </div>

            <div className="settings-section" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Reservation Configuration
                </h3>
                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="reservationGracePeriod">Reservation Grace Period (days after pickup date)</label>
                        <input 
                            type="number" 
                            id="reservationGracePeriod" 
                            className="form-control" 
                            min="0"
                            value={settings.reservation_grace_period || '3'} 
                            onChange={(e) => handleSettingInputChange('reservation_grace_period', e.target.value)}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="reservationDepositPolicy">On Reservation Expiry, Deposit is:</label>
                        <select 
                            id="reservationDepositPolicy" 
                            className="form-control" 
                            value={settings.reservation_deposit_policy || 'forfeit'} 
                            onChange={(e) => handleSettingInputChange('reservation_deposit_policy', e.target.value)}
                            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', width: '100%', outline: 'none' }}
                        >
                            <option value="forfeit">Forfeited (keep as revenue)</option>
                            <option value="refund">Refunded (auto-void transaction)</option>
                        </select>
                    </div>
                </div>
            </div>

            
        </div>
    );
}

