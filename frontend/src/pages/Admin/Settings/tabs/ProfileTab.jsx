import React from 'react';

export default function ProfileTab({
    profileData, setProfileData, handleProfileSubmit,
    setShowPasswordModal, showPIN, setShowPIN, isProfileDirty
}) {
    return (
        <div className="profile-page-body">
            <div className="profile-page-grid">
                
                {/* Photo & Profile Section */}
                <section className="profile-photo-section">
                    <div className="profile-section-card profile-photo-center">
                        <div className="profile-photo-preview-lg">
                            <div className="profile-photo-avatar-lg user-avatar-img">
                                {profileData.real_name ? profileData.real_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : (profileData.username ? profileData.username.slice(0,2).toUpperCase() : (profileData.role === 'Cashier' ? 'CA' : 'AD'))}
                            </div>
                        </div>
                        <h2 className="profile-section-title" style={{ marginTop: '16px' }}>Profile Photo</h2>
                        <p className="profile-section-desc" style={{ marginBottom: '20px' }}>
                            This photo will appear in the sidebar and across the system.
                        </p>
                        <div className="profile-photo-actions" style={{ flexDirection: 'column' }}>
                            <button type="button" className="btn btn-secondary profile-upload-btn" style={{ width: '100%' }}>Upload New Photo</button>
                            <button type="button" className="btn btn-danger profile-remove-btn" style={{ width: '100%', background: 'transparent', border: 'none', color: '#DC2626' }}>Remove Photo</button>
                        </div>
                    </div>
                </section>

                {/* Personal Details Panel */}
                <section className="profile-fields-block">
                    <div className="profile-section-card profile-personal-section" style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h2 className="profile-section-title" style={{ marginBottom: '4px' }}>Personal Information</h2>
                                <p className="profile-section-desc" style={{ margin: 0 }}>Your name is shown on the dashboard greeting and reservation records.</p>
                            </div>
                            <span className="profile-account-badge">{profileData.role || 'Cashier'}</span>
                        </div>

                        <form onSubmit={handleProfileSubmit}>
                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="profileName">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="profileName" 
                                        className="form-control profile-input" 
                                        value={profileData.real_name} 
                                        onChange={(e) => setProfileData({...profileData, real_name: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="profileEmail">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="profileEmail" 
                                        className="form-control profile-input" 
                                        value={profileData.email} 
                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="profileUsername">Login Username</label>
                                    <input 
                                        type="text" 
                                        id="profileUsername" 
                                        className="form-control profile-input" 
                                        value={profileData.username} 
                                        onChange={(e) => setProfileData({...profileData, username: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="profilePin">Manager PIN</label>
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <input 
                                            type={showPIN ? "text" : "password"} 
                                            id="profilePin" 
                                            maxLength="4"
                                            className="form-control profile-input profile-pwd-input" 
                                            value={profileData.pin} 
                                            onChange={(e) => setProfileData({...profileData, pin: e.target.value.replace(/\D/g, '')})} 
                                            style={{ paddingRight: '40px', letterSpacing: '2px', fontWeight: 'bold' }} 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPIN(!showPIN)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '4px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                                        >
                                            {showPIN ? (
                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Account</label>
                                    <div className="profile-readonly-field">{profileData.role || 'Cashier'}</div>
                                </div>
                            </div>
                            
                            <div className="profile-actions-bar" style={{ marginTop: '24px', padding: '16px 0 0 0', background: 'none', borderTop: '1px solid var(--border)', position: 'static', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary" disabled={!isProfileDirty}>Save Changes</button>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="profile-section-card profile-security-section">
                        <div className="profile-security-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className="profile-section-title" style={{ marginBottom: '4px' }}>Password & Security</h2>
                                <p className="profile-section-desc" style={{ margin: 0 }}>Update your login password. You must enter your current password to confirm.</p>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

