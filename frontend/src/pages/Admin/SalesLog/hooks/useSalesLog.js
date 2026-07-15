import { useState, useMemo, useEffect } from 'react';
import usePaginatedCache from '../../../../shared/hooks/usePaginatedCache';
import echo from '../../../../lib/echo';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-US')}`;

export default function useSalesLog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [timeFilter, setTimeFilter] = useState('All');
    const [cashierFilter, setCashierFilter] = useState('All');
    const [sortFilter, setSortFilter] = useState('Transaction #');
    const [activeTab, setActiveTab] = useState('All');
    const statusParam = activeTab === 'All' ? '' : 
        (activeTab === 'Refund' ? 'Refund,Return' : 
        (activeTab === 'Completed' ? 'Completed,Paid' : activeTab));
    const paymentParam = paymentFilter === 'All' ? '' : paymentFilter;
    const searchParam = searchQuery.trim();

    const queryParams = useMemo(() => ({
        status: statusParam,
        payment_method: paymentParam,
        search: searchParam,
    }), [statusParam, paymentParam, searchParam]);

    const { data: transactions, loading, page, setPage, pagination, refetch } = usePaginatedCache('sales', '/transactions', queryParams);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let channel = null;

        if (token && userStr) {
            const user = JSON.parse(userStr);
            if (['Admin', 'Supervisor', 'Cashier'].includes(user.role)) {
                channel = echo.private('transactions')
                    .listen('.TransactionCreated', (e) => {
                        console.log('[Echo Debug] SalesLog TransactionCreated event received:', e);
                        refetch();
                    })
                    .listen('.TransactionUpdated', (e) => {
                        console.log('[Echo Debug] SalesLog TransactionUpdated event received:', e);
                        refetch();
                    });
            }
        }

        return () => {
            if (channel) {
                echo.leaveChannel('private-transactions');
            }
        };
    }, [refetch]);

    // Flatten transactions into items to match the Sales Log mockup
    let flattenedItems = [];
    transactions.forEach(t => {
        const items = (t.items && t.items.length > 0) ? t.items : [{
            id: null,
            name: t.itemName || 'Transaction',
            partNo: 'N/A',
            qty: 1,
            price: t.amount,
            variant: ''
        }];
        
        items.forEach(item => {
            flattenedItems.push({
                ...item,
                _txDate: t.date || t.created_at,
                _txReceipt: t.receipt_number,
                _txCustomer: t.customer?.name || 'Guest',
                _txCashier: t.cashier?.name || 'Unknown',
                _txPayment: t.payment_method || '—',
                _txStatus: t.status,
                _txId: t.id
            });
        });
    });

    // We no longer filter client-side because backend handles it via usePaginatedCache
    let filteredItems = flattenedItems;

    // Dynamic Summary calculation
    const uniqueTxIds = new Set(filteredItems.map(item => item._txId));
    const uniqueTxs = transactions.filter(t => uniqueTxIds.has(t.id));

    let totalSales = 0;
    let totalRefunds = 0;
    let count = uniqueTxs.length;

    uniqueTxs.forEach(t => {
        if (t.status === 'Completed' || t.status === 'Paid') {
            totalSales += parseFloat(t.amount || 0);
        }
        if (t.status === 'Refund' || t.status === 'Return') {
            totalRefunds += parseFloat(t.amount || 0);
        }
    });

    const avgSale = count > 0 ? totalSales / count : 0;
    const metrics = { totalTx: count, totalSales, totalRefunds, avgSale };

    return {
        loading,
        transactions,
        filteredItems,
        totalSales,
        totalRefunds,
        count: pagination.total,
        page,
        setPage,
        pagination,
        
        searchQuery, setSearchQuery,
        paymentFilter, setPaymentFilter,
        timeFilter, setTimeFilter,
        cashierFilter, setCashierFilter,
        sortFilter, setSortFilter,
        activeTab, setActiveTab,
        metrics,
        fmt,
        fmtDate
    };
}
