import { useState, useEffect } from 'react';
import { useInventory } from '../../../../contexts/InventoryContext';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { fetchDashboardData } from '../../../../shared/hooks/useDashboardCache';
import { flattenToSellableSKUs } from '../../../../shared/utils/skuHelpers';

export function useDashboard() {
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const name = user ? user.real_name || user.name : 'Administrator';
    const [loading, setLoading] = useState(true);

    const [currentTimeRange, setCurrentTimeRange] = useState('Today');
    
    // UI state
    const [stats, setStats] = useState({
        totalStock: 0,
        todayRevenue: 0,
        employeeCount: 0,
        topProduct: { name: '-', qty: 0 }
    });

    // Replace local fetch with context
    const { unreadCount: notificationsCount } = useNotifications();
    const { inventory: products } = useInventory();
    
    // Top selling products state
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const cachedStats = await fetchDashboardData(products);

                // Calculate total items on hand (sum of all stocks)
                const sellableSKUs = flattenToSellableSKUs(products);
                const totalStock = sellableSKUs.reduce((sum, item) => sum + (item.stock || 0), 0);

                setStats({
                    totalStock: totalStock,
                    todayRevenue: cachedStats.todayRevenue,
                    employeeCount: cachedStats.employeeCount,
                    topProduct: cachedStats.topProduct,
                    last7Days: cachedStats.last7Days || []
                });

                const topSellers = cachedStats.topSellers;
                if (topSellers.length > 0) {
                    const mapped = topSellers.slice(0, 5).map((p, idx) => {
                        const maxSales = topSellers[0].sales_count || 1;
                        return {
                            rank: idx + 1,
                            name: p.name,
                            partNo: p.part_no,
                            category: p.category ? p.category.name : 'Heavy Parts',
                            unitsSold: p.sales_count,
                            revenue: p.sales_count * (p.price1 || 1000), // Estimate revenue
                            percentage: Math.round((p.sales_count / maxSales) * 100),
                            image: p.image || ''
                        };
                    });
                    setTopProducts(mapped);
                }
            } catch (err) {
                console.error("Error loading dashboard data: ", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [products]);

    return {
        name,
        loading,
        currentTimeRange,
        setCurrentTimeRange,
        stats,
        notificationsCount,
        topProducts
    };
}
