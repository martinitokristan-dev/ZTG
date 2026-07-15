import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../shared/api';
import echo from '../lib/echo';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const optimisticTimestamps = useRef({});
    const pollTimer = useRef(null);

    const fetchNotifications = useCallback(async () => {
        // Skip fetch entirely when not authenticated
        if (!localStorage.getItem('auth_token')) return;

        const fetchStart = Date.now();
        try {
            const res = await api.get('/notifications');
            const notifs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            
            const mappedNotifs = notifs.map(n => ({
                id: n.id,
                type: n.type || 'system',
                title: n.title,
                message: n.message,
                timestamp: new Date(n.created_at || n.timestamp).getTime(),
                read: n.is_read || n.read || false
            }));

            setNotifications(prev => {
                // Merge respecting optimistic timestamps
                const newMap = new Map(mappedNotifs.map(n => [n.id, n]));
                
                // Add existing items if they have a newer optimistic timestamp
                prev.forEach(existing => {
                    const optTime = optimisticTimestamps.current[existing.id];
                    if (optTime && optTime > fetchStart) {
                        newMap.set(existing.id, existing); // Override with local optimistic state
                    }
                });

                // Convert map back to array and sort by timestamp descending
                return Array.from(newMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            });
        } catch (err) {
            console.error("Failed to load notifications:", err);
        }
    }, []);

    const schedulePoll = useCallback((delay = 300000) => { // 5 minutes fallback
        if (pollTimer.current) clearTimeout(pollTimer.current);
        pollTimer.current = setTimeout(() => {
            fetchNotifications().finally(() => schedulePoll());
        }, delay);
    }, [fetchNotifications]);

    useEffect(() => {
        fetchNotifications().finally(() => schedulePoll(300000));

        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let channel = null;

        if (token && userStr) {
            const user = JSON.parse(userStr);
            if (['Admin', 'Supervisor'].includes(user.role)) {
                channel = echo.private('notifications')
                    .listen('.NotificationSent', (e) => {
                        console.log('[Echo Debug] NotificationSent event received:', e);
                        setNotifications(prev => {
                            if (prev.some(n => n.id === e.notification.id)) {
                                return prev;
                            }
                            const newNotification = {
                                ...e.notification,
                                timestamp: new Date(e.notification.timestamp).getTime()
                            };
                            return [newNotification, ...prev].sort((a, b) => b.timestamp - a.timestamp);
                        });
                    });
            }
        }

        return () => {
            if (pollTimer.current) clearTimeout(pollTimer.current);
            if (channel) {
                echo.leaveChannel('private-notifications');
            }
        };
    }, [fetchNotifications, schedulePoll]);

    const debouncePoll = () => {
        schedulePoll(5000);
    };

    const markAsRead = async (id) => {
        const previousState = [...notifications];
        const now = Date.now();
        optimisticTimestamps.current[id] = now;

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        try {
            await api.patch(`/notifications/${id}/read`);
            debouncePoll();
        } catch (err) {
            console.error("Failed to mark as read:", err);
            setNotifications(previousState);
            delete optimisticTimestamps.current[id];
        }
    };

    const markAllRead = async () => {
        const previousState = [...notifications];
        const now = Date.now();
        
        setNotifications(prev => {
            const next = prev.map(n => {
                optimisticTimestamps.current[n.id] = now;
                return { ...n, read: true };
            });
            return next;
        });

        try {
            await api.post('/notifications/read-all');
            debouncePoll();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            setNotifications(previousState);
            previousState.forEach(n => delete optimisticTimestamps.current[n.id]);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            markAsRead, 
            markAllRead, 
            refetch: fetchNotifications 
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
