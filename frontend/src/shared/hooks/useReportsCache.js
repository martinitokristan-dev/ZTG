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

export async function fetchReportsData(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';

    // Always fetch fresh data if dates are provided, bypassing the TTL cache
    // Or we can just ignore TTL for now as the user expects fresh data on date change
    reportsCache.promise = Promise.all([
        api.get(`/reports/sales-summary${qs}`).catch(() => ({ data: {} })),
        api.get(`/reports/product-performance${qs}`).catch(() => ({ data: {} })),
        api.get(`/reports/refund-void-analysis${qs}`).catch(() => ({ data: {} })),
        api.get(`/customer-log`).catch(() => ({ data: [] })),
        api.get(`/reports/generation-status`).catch(() => ({ data: { generated: false } }))
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
