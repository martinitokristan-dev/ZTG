import React from 'react';

export default function StatusBadge({ status, style = {} }) {
    const raw = status || 'Unknown';
    const norm = raw.toLowerCase();

    let bg = '#F3F4F6';
    let color = '#4B5563';
    let text = raw;

    switch (norm) {
        case 'completed':
            bg = '#F0FDF4'; color = '#10B981'; text = 'Completed';
            break;
        case 'pending':
            bg = '#FFFBEB'; color = '#D97706'; text = 'Pending Order';
            break;
        case 'deposit':
            bg = '#EFF6FF'; color = '#2563EB'; text = 'Deposit';
            break;
        case 'refund':
            bg = '#FEF2F2'; color = '#DC2626'; text = 'Refund';
            break;
        case 'return':
            bg = '#FFF7ED'; color = '#EA580C'; text = 'Returned';
            break;
        case 'void':
            bg = '#F1F5F9'; color = '#475569'; text = 'Voided';
            break;
        case 'cancelled':
            bg = '#F1F5F9'; color = '#475569'; text = 'Cancelled';
            break;
        default:
            // Fallback uses the initial neutral gray settings and raw text
            break;
    }

    return (
        <span style={{ 
            backgroundColor: bg, 
            color: color, 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontWeight: '700',
            fontSize: '11px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            ...style
        }}>
            {text}
        </span>
    );
}
