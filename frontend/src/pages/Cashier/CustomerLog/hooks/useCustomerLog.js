import { useState, useMemo } from 'react';
import useCustomerCache from '../../../../shared/hooks/useCustomerCache';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function useCustomerLog() {
    const { customers, loading } = useCustomerCache();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = useMemo(() => {
        if (searchQuery.trim() === '') return customers;
        const q = searchQuery.toLowerCase();
        return customers.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.contact || c.contact_number || '').toLowerCase().includes(q)
        );
    }, [customers, searchQuery]);

    return {
        loading,
        customers: filteredCustomers,
        searchQuery,
        setSearchQuery,
        fmtDate
    };
}
