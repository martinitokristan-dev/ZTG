import api from '../api';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

let dashboardCache = {
    data: null,
    fetchedAt: 0,
    promise: null
};

export const resetDashboardCache = () => {
    dashboardCache = { data: null, fetchedAt: 0, promise: null };
};

export async function fetchDashboardData(products) {
    const now = Date.now();
    if (dashboardCache.data && (now - dashboardCache.fetchedAt < TTL_MS)) {
        return dashboardCache.data;
    }

    if (dashboardCache.promise) {
        return dashboardCache.promise;
    }

    dashboardCache.promise = Promise.all([
        api.get('/reports/sales-summary').catch(() => ({ data: { total_revenue: 0 } })),
        api.get('/reports/product-performance').catch(() => ({ data: { top_sellers: [] } })),
        api.get('/employees').catch(() => ({ data: [] }))
    ]).then(([summaryRes, performanceRes, employeesRes]) => {
        const topSellers = performanceRes.data.top_sellers || [];
        const topProduct = topSellers.length > 0 
            ? { name: topSellers[0].name, qty: topSellers[0].sales_count }
            : { name: '-', qty: 0 };

        const stats = {
            todayRevenue: summaryRes.data.total_revenue || 0,
            employeeCount: Array.isArray(employeesRes.data) ? employeesRes.data.length : 0,
            topProduct,
            topSellers,
            last7Days: summaryRes.data.last_7_days || []
        };

        dashboardCache.data = stats;
        dashboardCache.fetchedAt = Date.now();
        dashboardCache.promise = null;
        return stats;
    }).catch(err => {
        dashboardCache.promise = null;
        throw err;
    });

    return dashboardCache.promise;
}
