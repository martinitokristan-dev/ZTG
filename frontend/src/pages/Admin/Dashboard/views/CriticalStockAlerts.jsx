import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CriticalStockAlerts() {
    const navigate = useNavigate();
    
    return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 20px 0' }}>Critical Stock Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                    { name: 'Track Link Assembly', sku: 'TRK-003' },
                    { name: 'Alternator 24V', sku: 'ELE-007' },
                    { name: 'Alternator 24V', sku: 'ELE-008' },
                    { name: 'Rubber Track', sku: 'RT-402' },
                ].map((item, idx, arr) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 0',
                        borderBottom: idx < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                    }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{item.sku}</div>
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: '#EF4444',
                            backgroundColor: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 4, padding: '3px 8px', letterSpacing: '0.3px',
                        }}>OUT OF STOCK</span>
                    </div>
                ))}
            </div>
            <button
                onClick={() => navigate('/inventory')}
                style={{
                    marginTop: 16, width: '100%', padding: '10px 0',
                    backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 8, fontSize: 13, fontWeight: 600,
                    color: '#64748B', cursor: 'pointer', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            >
                Manage Stock
            </button>
        </div>
    );
}
