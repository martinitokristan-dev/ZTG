import React from 'react';

export default function CheckersTab({ checkers, openEditChecker, openAddChecker }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Warehouse Checkers</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Manage the list of warehouse staff who check and fulfill items.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={openAddChecker} style={{ fontSize: '13px', padding: '8px 16px' }}>
                    + Add Checker
                </button>
            </div>
            
            <div className="card table-card">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>NAME</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>STATUS</th>
                            <th style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '13px' }}>
                        {checkers.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No checkers found.</td>
                            </tr>
                        ) : (
                            checkers.map(checker => (
                                <tr key={checker.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>{checker.name}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                                            backgroundColor: checker.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                                            color: checker.status === 'Active' ? '#166534' : '#475569'
                                        }}>
                                            {checker.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => openEditChecker(checker)} style={{ fontSize: '11px', padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
