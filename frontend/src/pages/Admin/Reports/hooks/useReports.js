import { useState, useEffect } from 'react';
import { fetchReportsData } from '../../../../shared/hooks/useReportsCache';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-US')}`;

export default function useReports() {
    const [loading, setLoading] = useState(true);

    // Reports Data State
    const [salesSummary, setSalesSummary] = useState(null);
    const [productPerformance, setProductPerformance] = useState(null);
    const [refundVoidAnalysis, setRefundVoidAnalysis] = useState(null);
    const [customerLog, setCustomerLog] = useState([]);
    const [isReportGenerated, setIsReportGenerated] = useState(false);

    const loadReports = async () => {
        try {
            setLoading(true);
            const cachedStats = await fetchReportsData();

            setSalesSummary(cachedStats.salesSummary);
            setProductPerformance(cachedStats.productPerformance);
            setRefundVoidAnalysis(cachedStats.refundVoidAnalysis);
            setCustomerLog(cachedStats.customerLog);
            setIsReportGenerated(cachedStats.isReportGenerated);
        } catch (err) {
            console.error("Error loading reports:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    return {
        loading,
        salesSummary,
        productPerformance,
        refundVoidAnalysis,
        customerLog,
        isReportGenerated,
        setIsReportGenerated,
        fmt,
        fmtDate
    };
}
