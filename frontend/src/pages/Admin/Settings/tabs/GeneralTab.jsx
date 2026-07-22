import React, { useRef } from 'react';

export default function GeneralTab({ 
    settings, 
    handleSettingInputChange, 
    handleToggleSetting, 
    handleSaveBulkSettings, 
    logoUrl, 
    onLogoUpload, 
    onLogoRemove, 
    logoUploading,
    logoRemoving,
    isEditing,
    onStartEdit,
    onCancelEdit
}) {
    const logoInputRef = useRef(null);

    return (
        <div className="card" style={{ marginBottom: '16px', paddingBottom: '24px' }}>
            <div className="settings-section">
                {/* Header with inline Card Edit / Save / Cancel Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                            Business Identity & Compliance
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                            Configure official store identity, BIR tax details, and receipt information
                        </p>
                    </div>
                    {!isEditing ? (
                        <button 
                            type="button" 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '6px 14px', fontWeight: 600 }}
                            onClick={onStartEdit}
                        >
                            Edit Settings
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                type="button" 
                                className="btn btn-secondary btn-sm" 
                                style={{ padding: '6px 14px' }}
                                onClick={onCancelEdit}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-primary btn-sm" 
                                style={{ padding: '6px 14px' }}
                                onClick={handleSaveBulkSettings}
                            >
                                Save Settings
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Business Identity fields: Logo left, all fields compact right ── */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>

                    {/* Logo uploader – fixed left column */}
                    <div style={{ flexShrink: 0, width: '200px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Business Logo</label>
                        <div
                            style={{
                                width: '200px', height: '160px', border: '2px dashed var(--border)',
                                borderRadius: '12px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', overflow: 'hidden',
                                background: 'var(--bg-secondary)'
                            }}
                        >
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt="Business logo"
                                    style={{ maxWidth: '190px', maxHeight: '150px', objectFit: 'contain' }}
                                />
                            ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px', lineHeight: 1.5 }}>
                                    No logo<br />uploaded
                                </span>
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        style={{ fontSize: '11px', padding: '4px 10px', flex: 1 }}
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={logoUploading || logoRemoving}
                                    >
                                        {logoUploading ? 'Uploading…' : logoUrl ? 'Change' : 'Upload'}
                                    </button>
                                    {logoUrl && (
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{ fontSize: '11px', padding: '4px 10px', color: '#EF4444', border: '1px solid #EF4444', background: 'transparent' }}
                                            onClick={onLogoRemove}
                                            disabled={logoUploading || logoRemoving}
                                        >
                                            {logoRemoving ? 'Removing…' : 'Remove'}
                                        </button>
                                    )}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    JPG, PNG, WebP · max 2MB
                                </div>
                            </>
                        )}
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={onLogoUpload}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* All business detail fields – compact 2-column grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>

                        {/* Row 1: Business Name | Branch Location */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" htmlFor="businessName">Business Name</label>
                            <input
                                type="text"
                                id="businessName"
                                className="form-control"
                                value={settings.business_name || ''}
                                onChange={(e) => handleSettingInputChange('business_name', e.target.value)}
                                disabled={!isEditing}
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
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Row 2: Full Business Address – spans both columns */}
                        <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                            <label className="form-label" htmlFor="businessAddress">
                                Full Business Address
                                <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                                <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '8px' }}>Appears on all printed receipts</span>
                            </label>
                            <input
                                type="text"
                                id="businessAddress"
                                className="form-control"
                                placeholder="e.g. 123 Industrial Ave., Brgy. San Jose, Butuan City, Agusan del Norte"
                                value={settings.address || ''}
                                onChange={(e) => handleSettingInputChange('address', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Row 3: Contact | Email */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" htmlFor="contactNumber">
                                Contact Number
                                <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                            </label>
                            <input
                                type="text"
                                id="contactNumber"
                                className="form-control"
                                placeholder="e.g. 0917-000-1111"
                                value={settings.contact_number || ''}
                                onChange={(e) => handleSettingInputChange('contact_number', e.target.value)}
                                disabled={!isEditing}
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
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Row 4: BIR TIN | Tax Rate | Currency */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" htmlFor="businessTin">
                                BIR TIN Number
                                <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>
                                <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '8px' }}>Frozen on each transaction</span>
                            </label>
                            <input
                                type="text"
                                id="businessTin"
                                className="form-control"
                                placeholder="e.g. 000-123-456-000"
                                value={settings.tin || ''}
                                onChange={(e) => handleSettingInputChange('tin', e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" htmlFor="taxRate">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    id="taxRate"
                                    className="form-control"
                                    value={settings.tax_rate || ''}
                                    onChange={(e) => handleSettingInputChange('tax_rate', e.target.value)}
                                    disabled={!isEditing}
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
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

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
                            disabled={!isEditing}
                            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', width: '100%', outline: 'none', opacity: isEditing ? 1 : 0.7 }}
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
                            disabled={!isEditing}
                        />
                    </div>
                </div>
                
                <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: '16px' }}>
                    <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: isEditing ? 'pointer' : 'default', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Automatically deduct stock after completed sales
                        </span>
                        <input
                            type="checkbox"
                            checked={settings.auto_deduct_stock === 'true'}
                            onChange={() => isEditing && handleToggleSetting('auto_deduct_stock')}
                            disabled={!isEditing}
                        />
                    </label>
                    <label className="toggle-row" style={{ display: 'flex', alignItems: 'center', cursor: isEditing ? 'pointer' : 'default', padding: '8px 0' }}>
                        <span className="toggle-label" style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                            Track damaged products counts separately
                        </span>
                        <input
                            type="checkbox"
                            checked={settings.track_damaged_separately === 'true'}
                            onChange={() => isEditing && handleToggleSetting('track_damaged_separately')}
                            disabled={!isEditing}
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
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="reservationDepositPolicy">On Reservation Expiry, Deposit is:</label>
                        <select
                            id="reservationDepositPolicy"
                            className="form-control"
                            value={settings.reservation_deposit_policy || 'forfeit'}
                            onChange={(e) => handleSettingInputChange('reservation_deposit_policy', e.target.value)}
                            disabled={!isEditing}
                            style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', width: '100%', outline: 'none', opacity: isEditing ? 1 : 0.7 }}
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
