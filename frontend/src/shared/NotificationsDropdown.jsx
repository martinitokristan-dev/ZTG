import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        await markAllRead();
    };

    const handleMarkRead = async (id) => {
        await markAsRead(id);
        setIsOpen(false);
    };

    return (
        <div className="notif-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <button id="notifBellBtn" className="notif-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Notifications" data-tooltip="Notifications">
                <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', fill: 'none', stroke: 'var(--text-secondary, #64748B)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="notif-badge pulse">{unreadCount}</span>
                )}
            </button>
            
            {isOpen && (
                <div className="notif-dropdown" style={{ display: 'block', zIndex: 50, right: 0, marginTop: '8px', position: 'absolute', width: '420px', background: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border, #E2E8F0)', background: '#F8FAFC', borderRadius: '12px 12px 0 0' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary, #0F172A)' }}>Notifications</span>
                        <button onClick={handleMarkAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary, #3B82F6)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Mark all as read</button>
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted, #94A3B8)', fontSize: '13px' }}>
                                No notifications to display.
                            </div>
                        ) : notifications.map(n => {
                            let iconBg = '#FEF2F2';
                            let iconColor = '#EF4444';
                            let iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
                            
                            const subType = n.sub_type || '';
                            const title = n.title || '';
                            
                            // Default transaction icon (Checkmark for Sales)
                            if (n.type === 'transaction' || subType === 'Completed' || title.includes('Completed')) {
                                iconBg = '#ECFDF5';
                                iconColor = '#10B981';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                            }

                            // Reservation / Deposit icon (Clock/Calendar)
                            if (subType === 'Paid' || subType === 'Deposit' || title.includes('Reservation') || title.includes('Deposit')) {
                                iconBg = '#EEF2FF';
                                iconColor = '#4F46E5';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                            }

                            if (subType === 'Refund' || subType === 'Return' || title.includes('Refund') || title.includes('Return')) {
                                iconBg = '#FFFBEB';
                                iconColor = '#F59E0B';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>';
                            }

                            if (subType === 'Void' || subType === 'Damaged' || title.includes('Void') || title.includes('Damaged')) {
                                iconBg = '#FEF2F2';
                                iconColor = '#DC2626';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>';
                            }

                            if (subType === 'Restocked' || title.includes('Restocked')) {
                                iconBg = '#EFF6FF';
                                iconColor = '#3B82F6';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                            }

                            if (n.type === 'inventory' || subType === 'Low Stock' || subType === 'Out of Stock' || title.includes('Stock')) {
                                iconBg = '#FFFBEB';
                                iconColor = '#D97706';
                                iconSvg = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';
                            }
                            
                            // Simple time ago formatter for UI consistency
                            const mins = Math.floor((new Date().getTime() - n.timestamp) / 60000);
                            let timeStr = 'Just now';
                            if (mins > 60) {
                                const hours = Math.floor(mins / 60);
                                timeStr = hours >= 24 ? `${Math.floor(hours/24)}d ago` : `${hours}h ago`;
                            } else if (mins > 0) {
                                timeStr = `${mins}m ago`;
                            }

                            return (
                                <div key={n.id} onClick={() => handleMarkRead(n.id)} style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: '1px solid var(--border, #E2E8F0)', cursor: 'pointer', background: n.read ? '#fff' : '#F8FAFC', transition: 'background 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', background: iconBg, color: iconColor, borderRadius: '10px', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: iconSvg }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{n.title}</strong>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)', flexShrink: 0 }}>{timeStr}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary, #64748B)', lineHeight: 1.5, wordBreak: 'break-word' }}>{n.message}</div>
                                    </div>
                                    {!n.read && (
                                        <div className="unread-dot" style={{ width: '6px', height: '6px', background: '#3B82F6', borderRadius: '50%', alignSelf: 'center', flexShrink: 0, marginLeft: '8px' }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
