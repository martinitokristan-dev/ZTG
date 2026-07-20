import { useState, useEffect } from 'react';
import api from '../../../../shared/api';
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
    const [employees, setEmployees] = useState([]);

    // Global Date Range State
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
    const [startDate, setStartDate] = useState(localISOTime);
    const [endDate, setEndDate] = useState(localISOTime);

    const loadReports = async () => {
        try {
            setLoading(true);
            const cachedStats = await fetchReportsData(startDate, endDate);

            setSalesSummary(cachedStats.salesSummary);
            setProductPerformance(cachedStats.productPerformance);
            setRefundVoidAnalysis(cachedStats.refundVoidAnalysis);
            setCustomerLog(cachedStats.customerLog);
            setIsReportGenerated(cachedStats.isReportGenerated);

            try {
                const empRes = await api.get('/employees');
                setEmployees(empRes.data || []);
            } catch (e) {
                // Ignore fallback
            }
        } catch (err) {
            console.error("Error loading reports:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [startDate, endDate]);

    return {
        loading,
        salesSummary,
        productPerformance,
        refundVoidAnalysis,
        customerLog,
        isReportGenerated,
        setIsReportGenerated,
        employees,
        startDate, setStartDate,
        endDate, setEndDate,
        fmt,
        fmtDate
    };
}
