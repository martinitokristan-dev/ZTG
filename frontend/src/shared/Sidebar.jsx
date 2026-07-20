import React from 'react';
import { NavLink as RouterNavLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import api from './api';
import { clearEntireCache } from './hooks/usePaginatedCache';

function Sidebar() {
    const navigate = useRouterNavigate();
    const [user, setUser] = React.useState(() => {
        const userStr = localStorage.getItem('auth_user');
        return userStr ? JSON.parse(userStr) : null;
    });

    React.useEffect(() => {
        const handleUpdate = () => {
            const userStr = localStorage.getItem('auth_user');
            setUser(userStr ? JSON.parse(userStr) : null);
        };
        window.addEventListener('auth_user_updated', handleUpdate);
        return () => {
            window.removeEventListener('auth_user_updated', handleUpdate);
        };
    }, []);

    const role = user ? user.role : 'Guest';
    const name = user ? user.real_name || user.name : 'User';

    // Get initials for profile avatar bubble
    const getInitials = (userName) => {
        if (!userName) return 'AD';
        const parts = userName.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return userName.slice(0, 2).toUpperCase();
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout error: ', e);
        } finally {
            clearEntireCache();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            navigate('/login');
        }
    };

    // Admin Navigation
    const adminNavSections = [
        {
            title: 'Main',
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                )},
                { path: '/product-management', label: 'Product Management', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                )},
                { path: '/inventory', label: 'Inventory', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                )},
                { path: '/reservations', label: 'Order Based', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )},
            ]
        },
        {
            title: 'Records',
            items: [
                { path: '/history-logs', label: 'History Logs', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )},
                { path: '/sales-log', label: 'Sales Log', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )},
                { path: '/reports', label: 'Reports', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h-2a2 2 0 00-2-2z" />
                    </svg>
                )},
            ]
        },
        {
            title: 'Config',
            items: [
                { path: '/settings', label: 'System Settings', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                )},
            ]
        }
    ];

    // Cashier Navigation
    const cashierNavSections = [
        {
            title: 'Cashier',
            items: [
                { path: '/pos', label: 'Point of Sale (POS)', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )},
                { path: '/reservations', label: 'Order Based', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )},
            ]
        },
        {
            title: 'Records',
            items: [
                { path: '/daily-sales', label: 'Sales Log', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )},
                { path: '/customer-log', label: 'Customer Log', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )},
            ]
        },
        {
            title: 'Account',
            items: [
                { path: '/settings', label: 'My Profile', icon: (
                    <svg style={{ width: 18, height: 18, stroke: 'currentColor', fill: 'none', strokeWidth: 2, flexShrink: 0 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                )},
            ]
        }
    ];

    const navSections = role === 'Cashier' ? cashierNavSections : adminNavSections;

    return (
        <div style={{
            width: 260,
            flexShrink: 0,
            backgroundColor: '#1E293B',
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh / 0.9)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            userSelect: 'none',
        }}>
            {/* Brand Header */}
            <div style={{ padding: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg style={{ width: 20, height: 20, stroke: '#3B82F6', fill: 'none', strokeWidth: 2.5 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ZTG Heavy Parts
                </div>
                <div style={{ color: '#94A3B8', fontSize: 12, marginTop: 4, fontWeight: 500, letterSpacing: '0.5px' }}>
                    {role === 'Cashier' ? 'Cashier View' : 'Inventory & POS'}
                </div>
            </div>

            {/* Nav Menu */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
                {navSections.map((section) => (
                    <div key={section.title} style={{ marginBottom: 24 }}>
                        <div style={{
                            color: '#64748B',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            marginBottom: 8,
                            paddingLeft: 12,
                        }}>
                            {section.title}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {section.items.map((item) => (
                                <li key={item.path} style={{ marginBottom: 4 }}>
                                    <RouterNavLink
                                        to={item.path}
                                        style={({ isActive }) => ({
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            padding: '10px 12px',
                                            color: isActive ? '#FFFFFF' : '#94A3B8',
                                            textDecoration: 'none',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            borderRadius: 8,
                                            transition: 'all 0.2s ease',
                                            backgroundColor: isActive ? '#3B82F6' : 'transparent',
                                        })}
                                        onMouseEnter={(e) => {
                                            const link = e.currentTarget;
                                            if (!link.classList.contains('active')) {
                                                link.style.backgroundColor = '#334155';
                                                link.style.color = '#FFFFFF';
                                                link.querySelectorAll('svg').forEach(s => s.style.stroke = '#FFFFFF');
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            const link = e.currentTarget;
                                            const isActive = link.getAttribute('aria-current') === 'page';
                                            if (!isActive) {
                                                link.style.backgroundColor = 'transparent';
                                                link.style.color = '#94A3B8';
                                                link.querySelectorAll('svg').forEach(s => s.style.stroke = '#94A3B8');
                                            }
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </RouterNavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer / User Profile */}
            <div style={{
                padding: '14px 20px 16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                backgroundColor: 'rgba(0,0,0,0.1)',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
                    {/* Avatar */}
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        backgroundColor: user?.profile_photo ? 'transparent' : '#3B82F6',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: user?.profile_photo ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}>
                        {user?.profile_photo ? (
                            <img
                                src={user.profile_photo}
                                alt="User Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                        ) : (
                            getInitials(name)
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                        <div style={{ color: '#94A3B8', fontSize: 11 }}>{role === 'Admin' ? 'Administrator' : role}</div>
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        width: '100%',
                        color: '#EF4444',
                        fontSize: 12,
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '10px 0 0 0',
                        textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#EF4444'}
                >
                    <svg style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
