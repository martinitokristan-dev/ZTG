import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../../../contexts/InventoryContext';
import { flattenToSellableSKUs } from '../../../../shared/utils/skuHelpers';

export default function CriticalStockAlerts() {
    const navigate = useNavigate();
    const { inventory: products } = useInventory();

    const criticalItems = React.useMemo(() => {
        const flatSKUs = flattenToSellableSKUs(products);

        return flatSKUs
            .filter(item => item.status !== 'Disabled' && (item.stock === 0 || item.stock <= (item.alert_limit || 5)))
            .map(item => {
                // If it has a parent, format name as "Parent Name (Variant Description)"
                let displayName = item.name;
                if (item.parent_product_id) {
                    const parent = products.find(p => p.id === item.parent_product_id);
                    if (parent) {
                        const optionValues = Array.isArray(item.variant_options)
                            ? item.variant_options.map(opt => opt.value).join(', ')
                            : (Array.isArray(item.variantOptions) ? item.variantOptions.map(opt => opt.value).join(', ') : '');
                        
                        displayName = `${parent.name} (${optionValues || item.name})`;
                    }
                }

                return {
                    id: item.id,
                    name: displayName,
                    sku: item.part_no || item.partNo || 'N/A',
                    stock: item.stock,
                    isOut: item.stock === 0
                };
            })
            .sort((a, b) => {
                // Out of stock first, then sort by stock ascending
                if (a.isOut && !b.isOut) return -1;
                if (!a.isOut && b.isOut) return 1;
                return a.stock - b.stock;
            })
            .slice(0, 5);
    }, [products]);

    return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 20px 0' }}>Critical Stock Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {criticalItems.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                        ✓ All stock levels healthy
                    </div>
                ) : (
                    criticalItems.map((item, idx, arr) => (
                        <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: idx < arr.length - 1 ? '1px solid #F1F5F9' : 'none',
                        }}>
                            <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{item.sku}</div>
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: 700,
                                color: item.isOut ? '#EF4444' : '#D97706',
                                backgroundColor: item.isOut ? '#FEF2F2' : '#FFFBEB',
                                border: item.isOut ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(217,119,6,0.2)',
                                borderRadius: 4, padding: '3px 8px', letterSpacing: '0.3px',
                                flexShrink: 0
                            }}>
                                {item.isOut ? 'OUT OF STOCK' : `LOW STOCK (${item.stock})`}
                            </span>
                        </div>
                    ))
                )}
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
