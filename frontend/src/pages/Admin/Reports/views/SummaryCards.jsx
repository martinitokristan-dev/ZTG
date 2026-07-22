import React from 'react';

export default function SummaryCards({ salesSummary, refundVoidAnalysis, fmt }) {
    if (!salesSummary || !refundVoidAnalysis) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Revenue</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>{fmt(salesSummary.total_revenue || 0)}</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Across {salesSummary.transaction_count || 0} completed sales</div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Average Order Value</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>{fmt(salesSummary.average_transaction || 0)}</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Per completed transaction</div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Total Refunds</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>{fmt(refundVoidAnalysis.refund_amount || 0)}</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>From {refundVoidAnalysis.total_refunds || 0} refunded/returned items</div>
            </div>

            <div className="card" style={{ padding: '24px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>Voided Transactions</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A' }}>{refundVoidAnalysis.total_voids || 0}</div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>Total voided transactions recorded</div>
            </div>
        </div>
    );
}
