/**
 * useCustomerCache — shared module-level cache for /customer-log data.
 *
 * Used by both useCustomerLog.js (display) and usePOS.js (autocomplete).
 * A single fetch is shared across both consumers — no duplicate API calls.
 *
 * Cache invalidation strategy:
 *   Only invalidate when a genuinely new customer was registered during
 *   checkout (newCustomerName non-empty + no selectedCustomer). Walk-in
 *   and existing-customer checkouts do NOT invalidate the cache, since
 *   they do not create new customer records.
 */
import { useState, useEffect } from 'react';
import api from '../api';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

// Module-level cache — shared across all hook instances
let customerCache = {
    data: null,
    fetchedAt: 0,
    promise: null, // In-flight deduplication
};

export const resetCustomerCache = () => {
    customerCache = { data: null, fetchedAt: 0, promise: null };
};

async function fetchCustomers() {
    // Deduplicate concurrent fetches
    if (customerCache.promise) {
        return customerCache.promise;
    }

    customerCache.promise = api.get('/customer-log')
        .then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            customerCache.data = data;
            customerCache.fetchedAt = Date.now();
            customerCache.promise = null;
            return data;
        })
        .catch(err => {
            customerCache.promise = null;
            throw err;
        });

    return customerCache.promise;
}

/**
 * useCustomerCache hook — returns the customer list, loading state,
 * and a manual reload function.
 */
export default function useCustomerCache() {
    const [customers, setCustomers] = useState(customerCache.data || []);
    const [loading, setLoading] = useState(!customerCache.data);

    useEffect(() => {
        const now = Date.now();
        const isStale = now - customerCache.fetchedAt > TTL_MS;

        if (customerCache.data && !isStale) {
            // Serve from cache immediately
            setCustomers(customerCache.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        fetchCustomers()
            .then(data => {
                setCustomers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load customer log:', err);
                setLoading(false);
            });
    }, []);

    return { customers, loading };
}
