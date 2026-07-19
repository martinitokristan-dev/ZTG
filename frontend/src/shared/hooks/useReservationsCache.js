import api from '../api';

const TTL_MS = 2 * 60 * 1000; // 2 minutes

let reservationsCache = {
    pages: {}, // Key: `${search}_${status}` -> { data, ts }
};

export const resetReservationsCache = () => {
    reservationsCache = { pages: {} };
};

export async function fetchReservations(search = '', status = 'All') {
    const key = `${search}_${status}`;
    const now = Date.now();

    if (reservationsCache.pages[key] && (now - reservationsCache.pages[key].ts < TTL_MS)) {
        return reservationsCache.pages[key].data;
    }

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status !== 'All') params.set('status', status);

    const res = await api.get(`/reservations?${params}`);
    const payload = res.data;
    const data = Array.isArray(payload) ? payload : (payload?.data || []);

    reservationsCache.pages[key] = {
        data,
        ts: now
    };

    return data;
}
