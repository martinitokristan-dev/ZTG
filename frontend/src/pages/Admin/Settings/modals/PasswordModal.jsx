import React from 'react';

export default function PasswordModal({
    showPasswordModal, setShowPasswordModal,
    passwordData, setPasswordData, handlePasswordSubmit
}) {
    if (!showPasswordModal) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-content-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-slate-800">Change Account Password</h3>
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>
                <form onSubmit={handlePasswordSubmit}>
                    <div className="p-6 flex flex-col gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Password *</label>
                            <input 
                                type="password" 
                                required 
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">New Password *</label>
                            <input 
                                type="password" 
                                required 
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Confirm New Password *</label>
                            <input 
                                type="password" 
                                required 
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border border-slate-250 text-slate-500 rounded-lg text-xs font-bold bg-white hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
