import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationsDropdown from './NotificationsDropdown';

/**
 * AppShell — persistent authenticated layout.
 *
 * Sidebar and NotificationsDropdown live here and mount ONCE for the
 * lifetime of the authenticated session. They never remount on route
 * changes, so the badge CSS animation no longer restarts on navigation.
 *
 * Each page renders only its own content (title, top-bar actions, body).
 * The bell icon is positioned as a fixed top-right overlay so every page
 * gets the same consistent placement without needing to include it.
 */
export default function AppShell() {
    return (
        <div className="app-container">
            {/* Sidebar — mounts once, persists across all routes */}
            <Sidebar />

            {/*
             * Notification bell — fixed top-right, overlaid on every page's
             * top-bar area. Pages no longer need to render NotificationsDropdown
             * themselves. z-index 100 keeps it above page content.
             */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                zIndex: 100,
                padding: '17px 24px',
                pointerEvents: 'auto',
            }}>
                <NotificationsDropdown />
            </div>

            {/* Page content — changes on every navigation, shell stays mounted */}
            <div className="main-workspace">
                <Outlet />
            </div>
        </div>
    );
}
