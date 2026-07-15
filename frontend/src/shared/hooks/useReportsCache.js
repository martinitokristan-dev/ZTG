import api from '../api';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

let reportsCache = {
    data: null,
    fetchedAt: 0,
    promise: null
};

export const resetReportsCache = () => {
    reportsCache = { data: null, fetchedAt: 0, promise: null };
};

export async function fetchReportsData() {
    const now = Date.now();
    if (reportsCache.data && (now - reportsCache.fetchedAt < TTL_MS)) {
        return reportsCache.data;
    }

    if (reportsCache.promise) {
        return reportsCache.promise;
    }

    reportsCache.promise = Promise.all([
        api.get('/reports/sales-summary').catch(() => ({ data: {} })),
        api.get('/reports/product-performance').catch(() => ({ data: {} })),
        api.get('/reports/refund-void-analysis').catch(() => ({ data: {} })),
        api.get('/customer-log').catch(() => ({ data: [] })),
        api.get('/reports/generation-status').catch(() => ({ data: { generated: false } }))
    ]).then(([salesRes, perfRes, refundRes, customerRes, statusRes]) => {
        const stats = {
            salesSummary: salesRes.data,
            productPerformance: perfRes.data,
            refundVoidAnalysis: refundRes.data,
            customerLog: Array.isArray(customerRes.data) ? customerRes.data : [],
            isReportGenerated: statusRes.data?.generated || false
        };
        reportsCache.data = stats;
        reportsCache.fetchedAt = Date.now();
        reportsCache.promise = null;
        return stats;
    }).catch(err => {
        reportsCache.promise = null;
        throw err;
    });

    return reportsCache.promise;
}
