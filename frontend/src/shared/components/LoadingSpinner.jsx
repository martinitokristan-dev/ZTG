import React from 'react';

export default function LoadingSpinner({ text = 'Loading...', fullPage = false, minHeight = '400px' }) {
    const containerStyle = fullPage ? {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        color: 'var(--text-secondary)'
    } : {
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: minHeight, 
        color: 'var(--text-secondary)',
        width: '100%'
    };

    return (
        <div style={containerStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', marginRight: '10px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{text}</span>
        </div>
    );
}
