import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../../shared/api';
import { useProducts } from '../../../../contexts/ProductContext';
import { fetchReservations, resetReservationsCache } from '../../../../shared/hooks/useReservationsCache';
import echo from '../../../../lib/echo';

const fmt = (n) => `₱${Number(n || 0).toLocaleString('en-US')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function useReservations() {
    const { products, refetch: refetchProducts } = useProducts();
    /* ── User Session ── */
    const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } })();
    const userName = user?.real_name || user?.name || 'Staff';

    /* ── List State ── */
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    /* ── Modal Visibility ── */
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFulfillModal, setShowFulfillModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    /* ── Selected reservation (for fulfill / cancel) ── */
    const [selected, setSelected] = useState(null);
    const [successData, setSuccessData] = useState(null);

    /* ── Add-Order form state ── */
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custEmail, setCustEmail] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentType, setPaymentType] = useState('deposit50');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [cartItems, setCartItems] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    /* ── Fulfill form state ── */
    const [ffPaymentMethod, setFfPaymentMethod] = useState('Cash');
    const [ffAmountReceived, setFfAmountReceived] = useState('');
    const [ffDocType, setFfDocType] = useState('S.I.');
    const [ffNotes, setFfNotes] = useState('');
    const [ffError, setFfError] = useState('');
    const [ffLoading, setFfLoading] = useState(false);

    /* ── Cancel form state ── */
    const [cancelReason, setCancelReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    /* ──────────────────────────────────────────────── */
    /* DATA LOADING                                      */
    /* ──────────────────────────────────────────────── */
    const loadReservations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchReservations(search, statusFilter);
            setReservations(data);
        } catch (e) {
            console.error('Failed to load reservations:', e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { loadReservations(); }, [loadReservations]);
    
    useEffect(() => {
        refetchProducts();
    }, [refetchProducts]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let channel = null;

        if (token && userStr) {
            const user = JSON.parse(userStr);
            if (['Admin', 'Supervisor', 'Cashier'].includes(user.role)) {
                channel = echo.private('reservations')
                    .listen('.ReservationUpdated', (e) => {
                        console.log('[Echo Debug] Reservations ReservationUpdated event received:', e);
                        resetReservationsCache();
                        loadReservations();
                    });
            }
        }

        return () => {
            if (channel) {
                echo.leaveChannel('private-reservations');
            }
        };
    }, [loadReservations]);

    /* ──────────────────────────────────────────────── */
    /* PRODUCT SEARCH (for Add modal)                   */
    /* ──────────────────────────────────────────────── */
    const searchTimeout = useRef(null);
    const handleProductSearch = (val) => {
        setProductSearch(val);
        clearTimeout(searchTimeout.current);
        if (!val.trim()) { setSuggestions([]); return; }
        searchTimeout.current = setTimeout(() => {
            const q = val.toLowerCase();
            
            // Flatten products to include parent products (if no variants) and child variants
            const searchableItems = [];
            products.forEach(p => {
                if (p.variants && p.variants.length > 0) {
                    p.variants.forEach(v => {
                        const variantName = v.name || p.name;
                        const optionValues = Array.isArray(v.variant_options)
                            ? v.variant_options.map(opt => opt.value).join(', ')
                            : (Array.isArray(v.variantOptions) ? v.variantOptions.map(opt => opt.value).join(', ') : '');
                        
                        searchableItems.push({
                            id: v.id,
                            name: optionValues ? `${variantName} (${optionValues})` : variantName,
                            part_no: v.part_no || p.part_no,
                            stock: v.stock,
                            price2: v.price2,
                        });
                    });
                } else {
                    searchableItems.push(p);
                }
            });

            const results = searchableItems.filter(p => 
                (p.name || '').toLowerCase().includes(q) ||
                (p.part_no || p.partNo || '').toLowerCase().includes(q)
            ).slice(0, 10); // Limit to 10 suggestions
            setSuggestions(results);
        }, 150);
    };

    const addToCart = (product) => {
        setCartItems(prev => {
            const exists = prev.find(c => c.product_id === product.id);
            if (exists) return prev.map(c => c.product_id === product.id ? { ...c, qty: c.qty + 1 } : c);
            return [...prev, { product_id: product.id, name: product.name, part_no: product.part_no, price: parseFloat(product.price2 || 0), qty: 1, stock: product.stock }];
        });
        setProductSearch('');
        setSuggestions([]);
    };

    const removeFromCart = (product_id) => setCartItems(prev => prev.filter(c => c.product_id !== product_id));
    const updateQty = (product_id, qty) => setCartItems(prev => prev.map(c => c.product_id === product_id ? { ...c, qty: Math.max(1, parseInt(qty) || 1) } : c));

    /* ── Cart Calculations ── */
    const vatInclusiveTotal = cartItems.reduce((s, c) => s + c.price * c.qty, 0);
    const subtotal = vatInclusiveTotal / 1.12;
    const tax = vatInclusiveTotal - subtotal;
    const total = vatInclusiveTotal;
    const depositAmt = paymentType === 'full' ? total : total * 0.5;
    const balance = total - depositAmt;

    /* ──────────────────────────────────────────────── */
    /* SUBMIT: Create Reservation                        */
    /* ──────────────────────────────────────────────── */
    const resetAddForm = () => {
        setCustName(''); setCustPhone(''); setCustEmail('');
        setPickupDate(''); setPickupTime(''); setNotes('');
        setPaymentType('deposit50'); setPaymentMethod('Cash');
        setCartItems([]); setProductSearch(''); setSuggestions([]);
        setAddError('');
    };

    const handleAddReservation = async (e) => {
        e.preventDefault();
        setAddError('');
        if (cartItems.length === 0) { setAddError('Please add at least one item to the order.'); return; }
        setAddLoading(true);
        try {
            const payload = {
                customer_name: custName,
                customer_phone: custPhone,
                customer_email: custEmail,
                pickup_date: pickupDate,
                pickup_time: pickupTime,
                notes,
                payment_type: paymentType,
                payment_method: paymentMethod,
                deposit_amount: depositAmt,
                items: cartItems.map(c => ({ product_id: c.product_id, qty: c.qty, price: c.price })),
            };
            const res = await api.post('/reservations', payload);
            setSuccessData(res.data.reservation);
            setShowAddModal(false);
            setShowSuccessModal(true);
            resetAddForm();
            resetReservationsCache();
            loadReservations();
        } catch (err) {
            setAddError(err.response?.data?.message || 'Failed to create reservation.');
        } finally {
            setAddLoading(false);
        }
    };

    /* ──────────────────────────────────────────────── */
    /* FULFILL                                           */
    /* ──────────────────────────────────────────────── */
    const openFulfill = (r) => {
        setSelected(r);
        setFfPaymentMethod('Cash');
        setFfAmountReceived('');
        setFfDocType('S.I.');
        setFfNotes('');
        setFfError('');
        setShowFulfillModal(true);
    };

    const handleFulfill = async () => {
        setFfError('');
        const balanceDue = Number(selected?.total || 0) - Number(selected?.deposit || 0);
        if (!ffAmountReceived || parseFloat(ffAmountReceived) < 0) {
            setFfError('Please enter the amount received.'); return;
        }
        setFfLoading(true);
        try {
            const res = await api.post(`/reservations/${selected.id}/fulfill`, {
                balance_payment: parseFloat(ffAmountReceived),
                payment_method: ffPaymentMethod,
                doc_type: ffDocType,
                notes: ffNotes,
            });
            setSuccessData(res.data.reservation);
            setShowFulfillModal(false);
            setShowSuccessModal(true);
            resetReservationsCache();
            loadReservations();
        } catch (err) {
            console.error("Fulfill error:", err.response?.data);
            const errMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(' ')
                : (err.response?.data?.message || 'Failed to fulfill reservation.');
            setFfError(errMsg);
        } finally {
            setFfLoading(false);
        }
    };

    /* ──────────────────────────────────────────────── */
    /* CANCEL                                            */
    /* ──────────────────────────────────────────────── */
    const openCancel = (r) => { setSelected(r); setCancelReason(''); setShowCancelModal(true); };

    const handleCancel = async () => {
        setCancelLoading(true);
        try {
            await api.post(`/reservations/${selected.id}/cancel`, { reason: cancelReason });
            setShowCancelModal(false);
            resetReservationsCache();
            loadReservations();
        } catch (err) {
            console.error('Failed to cancel:', err);
        } finally {
            setCancelLoading(false);
        }
    };

    /* ──────────────────────────────────────────────── */
    /* FULFILL modal balance due calculation             */
    /* ──────────────────────────────────────────────── */
    const ffBalanceDue = selected ? (Number(selected.total || 0) - Number(selected.deposit || 0)) : 0;
    const ffChange = Math.max(0, (parseFloat(ffAmountReceived) || 0) - ffBalanceDue);

    return {
        // Data & Session
        reservations, loading, userName,
        
        // Formating
        fmt, fmtDate,

        // Filters
        search, setSearch,
        statusFilter, setStatusFilter,

        // Modal Controls
        showAddModal, setShowAddModal,
        showFulfillModal, setShowFulfillModal,
        showCancelModal, setShowCancelModal,
        showSuccessModal, setShowSuccessModal,

        // Selection
        selected, successData,

        // Add Modal State & Handlers
        custName, setCustName, custPhone, setCustPhone, custEmail, setCustEmail,
        pickupDate, setPickupDate, pickupTime, setPickupTime, notes, setNotes,
        paymentType, setPaymentType, paymentMethod, setPaymentMethod,
        cartItems, productSearch, suggestions, addError, addLoading,
        handleProductSearch, addToCart, removeFromCart, updateQty,
        resetAddForm, handleAddReservation,
        subtotal, tax, total, depositAmt, balance,

        // Fulfill Modal State & Handlers
        ffPaymentMethod, setFfPaymentMethod, ffAmountReceived, setFfAmountReceived,
        ffDocType, setFfDocType, ffNotes, setFfNotes, ffError, ffLoading,
        openFulfill, handleFulfill, ffBalanceDue, ffChange,

        // Cancel Modal State & Handlers
        cancelReason, setCancelReason, cancelLoading, openCancel, handleCancel
    };
}
