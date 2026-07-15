import { useState, useEffect } from 'react';
import api from '../../../../shared/api';
import { useProducts } from '../../../../contexts/ProductContext';
import { resetDashboardCache } from '../../../../shared/hooks/useDashboardCache';
import { resetReportsCache } from '../../../../shared/hooks/useReportsCache';
import echo from '../../../../lib/echo';

const DEFAULT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=80&q=80";

const DEFAULT_FORM = {
    name: '',
    chinese_name: '',
    part_no: '',
    category_id: '',
    address: '',
    aisle: '',
    carrier: '',
    hang: '',
    stock: 0,
    alert_limit: 5,
    price1: 0,
    price2: 0,
    image: '',
    notes: '',
    status: 'Active',
    is_dead_stock: false,
    damaged: 0
};

export default function useProductManagement() {
    // ── User session ────────────────────────────────────────────
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const currentUserName = user ? user.real_name || user.name : 'Administrator';

    // ── Data ────────────────────────────────────────────────────
    const { products: globalProducts, optimisticUpdateProduct, optimisticDeleteProduct, refetch: refetchProducts } = useProducts();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [variantOptions, setVariantOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── View mode: 'list' | 'restock' ──────────────────────────
    const [viewMode, setViewState] = useState('list');

    // ── List filters ────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOption, setSortOption] = useState('Default');

    // ── Restock filters ─────────────────────────────────────────
    const [restockSearch, setRestockSearch] = useState('');
    const [restockCategory, setRestockCategory] = useState('');
    const [restockStockLevel, setRestockStockLevel] = useState('All');
    const [restockQuantities, setRestockQuantities] = useState({});
    const [restockDate, setRestockDate] = useState('');
    const [restockTime, setRestockTime] = useState('');
    const [restockVerifiedBy, setRestockVerifiedBy] = useState(currentUserName);

    // ── Modal visibility ─────────────────────────────────────────
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDamageModal, setShowDamageModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReviewRestockModal, setShowReviewRestockModal] = useState(false);
    const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

    // ── Form state ───────────────────────────────────────────────
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({ ...DEFAULT_FORM });
    const [damageQty, setDamageQty] = useState(1);
    const [damageReason, setDamageReason] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ── API Calls ────────────────────────────────────────────────
    const loadProducts = async () => {
        try {
            setLoading(true);
            const queryParams = [];
            if (viewMode === 'list') {
                if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
                if (categoryId) queryParams.push(`category_id=${categoryId}`);
                if (statusFilter) queryParams.push(`status=${statusFilter}`);
            } else {
                if (restockSearch) queryParams.push(`search=${encodeURIComponent(restockSearch)}`);
                if (restockCategory) queryParams.push(`category_id=${restockCategory}`);
            }
            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
            const res = await api.get(`/products${queryString}`);
            const productsList = res.data || [];
            setProducts(productsList);

            if (viewMode === 'restock') {
                setRestockQuantities(prev => {
                    const next = { ...prev };
                    productsList.forEach(p => { if (next[p.id] === undefined) next[p.id] = 0; });
                    return next;
                });
            }
        } catch (e) {
            console.error('Failed to load products:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadVariantOptions = async () => {
        try {
            const res = await api.get('/variants');
            setVariantOptions(res.data || []);
        } catch (e) {
            console.error('Failed to load variants:', e);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get('/categories');
            const data = res.data || [];
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, category_id: prev.category_id || data[0].id }));
            }
        } catch (e) {
            console.error('Failed to load categories:', e);
        }
    };

    useEffect(() => { loadCategories(); loadVariantOptions(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => loadProducts(), 300);
        return () => clearTimeout(timer);
    }, [search, categoryId, statusFilter, viewMode, restockSearch, restockCategory]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        let productChannel = null;
        let inventoryChannel = null;

        if (token && userStr) {
            const user = JSON.parse(userStr);
            if (['Admin', 'Supervisor'].includes(user.role)) {
                productChannel = echo.private('products')
                    .listen('.ProductUpdated', (e) => {
                        console.log('[Echo Debug] ProductManagement ProductUpdated event received:', e);
                        setProducts(prev => prev.map(p => {
                            if (p.id === e.productId) {
                                return {
                                    ...p,
                                    ...e.changedFields
                                };
                            }
                            return p;
                        }));
                    });

                inventoryChannel = echo.private('inventory')
                    .listen('.InventoryUpdated', (e) => {
                        console.log('[Echo Debug] ProductManagement InventoryUpdated event received:', e);
                        setProducts(prev => prev.map(p => {
                            if (p.id === e.productId) {
                                return {
                                    ...p,
                                    stock: e.newQuantity
                                };
                            }
                            return p;
                        }));
                    });
            }
        }

        return () => {
            // stopListening removes only this hook's callbacks — do NOT call
            // echo.leaveChannel() here, which would destroy the global
            // ProductContext and InventoryContext Pusher subscriptions.
            if (productChannel) {
                productChannel.stopListening('.ProductUpdated');
            }
            if (inventoryChannel) {
                inventoryChannel.stopListening('.InventoryUpdated');
            }
        };
    }, []);

    // ── Helpers ──────────────────────────────────────────────────
    const getFormattedDateTime = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;
        const timeStr = `${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;
        return { dateStr, timeStr };
    };

    const resetForm = () => {
        setFormData({ ...DEFAULT_FORM, category_id: categories.length > 0 ? categories[0].id : '' });
        setDamageQty(1);
        setDamageReason('');
        setErrorMessage('');
        setSuccessMessage('');
    };

    // ── View switching ───────────────────────────────────────────
    const switchToRestock = () => {
        const { dateStr, timeStr } = getFormattedDateTime();
        setRestockDate(dateStr);
        setRestockTime(timeStr);
        setRestockVerifiedBy(currentUserName);

        const draftStr = localStorage.getItem('ztg_restock_draft');
        let draftObj = {};
        try { if (draftStr) draftObj = JSON.parse(draftStr); } catch (e) { }

        const q = {};
        products.forEach(p => { q[p.id] = draftObj[p.id] !== undefined ? draftObj[p.id] : 0; });
        setRestockQuantities(q);
        setRestockSearch('');
        setRestockCategory('');
        setRestockStockLevel('All');
        setViewState('restock');
    };

    const switchToProductsList = () => {
        setSearch(''); setCategoryId(''); setStatusFilter('');
        setViewState('list');
        resetForm();
    };

    // ── Restock actions ──────────────────────────────────────────
    const getRestockTotals = () => {
        let itemsCount = 0, unitsCount = 0;
        Object.entries(restockQuantities).forEach(([, qty]) => {
            if (qty > 0) { itemsCount++; unitsCount += qty; }
        });
        return { itemsCount, unitsCount };
    };

    const { itemsCount: restockItemsCount, unitsCount: restockUnitsCount } = getRestockTotals();

    const updateRestockQty = (productId, val) => {
        const value = Math.max(0, val);
        setRestockQuantities(prev => {
            const next = { ...prev, [productId]: value };
            localStorage.setItem('ztg_restock_draft', JSON.stringify(next));
            return next;
        });
    };

    const handleClearAllRestock = () => {
        setRestockQuantities(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => { next[k] = 0; });
            localStorage.removeItem('ztg_restock_draft');
            return next;
        });
    };

    const handleExitRestockAttempt = () => {
        if (restockUnitsCount > 0) setShowLeaveConfirmModal(true);
        else switchToProductsList();
    };

    const handleSaveDraftAndExit = () => {
        localStorage.setItem('ztg_restock_draft', JSON.stringify(restockQuantities));
        setShowLeaveConfirmModal(false);
        switchToProductsList();
    };

    const handleDiscardDraftAndExit = () => {
        localStorage.removeItem('ztg_restock_draft');
        setShowLeaveConfirmModal(false);
        switchToProductsList();
    };

    const handleConfirmRestock = async () => {
        try {
            setErrorMessage('');
            const payload = Object.entries(restockQuantities)
                .filter(([, qty]) => qty > 0)
                .map(([id, qty]) => ({ product_id: parseInt(id), qty }));
            if (payload.length === 0) return;
            
            // Optimistic update
            const rollbacks = [];
            payload.forEach(item => {
                const prod = products.find(p => p.id === item.product_id);
                if (prod) {
                    const { commit, rollback } = optimisticUpdateProduct(prod.id, { stock: prod.stock + item.qty });
                    rollbacks.push(rollback);
                }
            });

            await api.post('/products/restock', { restocks: payload });
            
            resetDashboardCache();
            resetReportsCache();
            localStorage.removeItem('ztg_restock_draft');
            setSuccessMessage(`Restocked ${restockUnitsCount} units across ${restockItemsCount} items successfully!`);
            setShowReviewRestockModal(false);
            switchToProductsList();
            refetchProducts(); // Silent background refetch
        } catch (error) {
            // Rollback all
            rollbacks.forEach(r => r());
            setErrorMessage(error.response?.data?.message || 'Error occurred while saving restock order.');
        }
    };

    // ── Product CRUD ─────────────────────────────────────────────
    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            setErrorMessage('');
            const res = await api.post('/products', formData);
            const newProd = res.data?.product || formData;
            optimisticUpdateProduct(newProd.id || Date.now(), newProd).commit();
            setSuccessMessage('Product added successfully!');
            setShowAddModal(false);
            resetForm();
            loadProducts(); // We still load to refresh search if needed, but the context is updated
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error occurred while saving product.');
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();
        const { commit, rollback } = optimisticUpdateProduct(selectedProduct.id, formData);
        try {
            setErrorMessage('');
            await api.put(`/products/${selectedProduct.id}`, formData);
            commit();
            setSuccessMessage('Product updated successfully!');
            setShowEditModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            rollback();
            setErrorMessage(error.response?.data?.message || 'Error occurred while updating product.');
        }
    };

    const handleDamageSubmit = async (e) => {
        e.preventDefault();
        const newStock = Math.max(0, selectedProduct.stock - parseInt(damageQty));
        const { commit, rollback } = optimisticUpdateProduct(selectedProduct.id, { stock: newStock });
        try {
            setErrorMessage('');
            await api.post(`/products/${selectedProduct.id}/damaged`, { qty: parseInt(damageQty), reason: damageReason });
            commit();
            setSuccessMessage('Damaged stock logged successfully!');
            setShowDamageModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            rollback();
            setErrorMessage(error.response?.data?.message || 'Error logging damaged stock.');
        }
    };

    const handleDeleteProduct = async (product) => {
        if (!window.confirm(`Are you sure you want to delete ${product.name}?`)) return;
        const { commit, rollback } = optimisticDeleteProduct(product.id);
        try {
            await api.delete(`/products/${product.id}`);
            commit();
            setSuccessMessage('Product deleted successfully!');
            loadProducts();
        } catch (error) {
            rollback();
            alert(error.response?.data?.message || 'Error deleting product.');
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            const newStatus = product.status === 'Disabled' ? 'Active' : 'Disabled';
            const payload = {
                name: product.name,
                chinese_name: product.chinese_name,
                part_no: product.part_no,
                category_id: product.category_id,
                address: product.address,
                stock: product.stock,
                alert_limit: product.alert_limit || 5,
                price1: product.price1,
                price2: product.price2,
                image: product.image,
                notes: product.notes,
                is_dead_stock: product.is_dead_stock,
                damaged: product.damaged,
                status: newStatus
            };
            await api.put(`/products/${product.id}`, payload);
            setSuccessMessage(`Product ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully!`);
            loadProducts();
        } catch (error) {
            alert(error.response?.data?.message || 'Error toggling product status.');
        }
    };

    // ── Form helpers ─────────────────────────────────────────────
    const handleAddressChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            const parts = [next.aisle?.trim(), next.carrier?.trim(), next.hang?.trim()].filter(Boolean);
            next.address = parts.join('-');
            return next;
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        try {
            setErrorMessage('');
            const res = await api.post('/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setFormData(prev => ({ ...prev, image: res.data.url }));
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'Failed to upload image file.');
        }
    };

    const openEdit = (product) => {
        setSelectedProduct(product);
        const parts = (product.address || '').split('-');
        setFormData({
            name: product.name, chinese_name: product.chinese_name || '',
            part_no: product.part_no, category_id: product.category_id,
            address: product.address || '',
            aisle: parts[0] || '', carrier: parts[1] || '', hang: parts[2] || '',
            stock: product.stock, alert_limit: product.alert_limit || 5,
            price1: product.price1, price2: product.price2,
            image: product.image || '', notes: product.notes || '',
            variants: product.variants ? product.variants.map(v => ({...v, option_ids: v.variant_options ? v.variant_options.map(o => o.id) : []})) : [],
            status: product.status || 'Active',
            is_dead_stock: !!product.is_dead_stock, damaged: product.damaged || 0
        });
        setShowEditModal(true);
    };

    const openDamage = (product) => { setSelectedProduct(product); setDamageQty(1); setDamageReason(''); setShowDamageModal(true); };
    const openView = (product) => { setSelectedProduct(product); setShowViewModal(true); };

    // ── Sorting / filtering ──────────────────────────────────────
    const getSortedProducts = () => {
        if (!products || products.length === 0) return [];
        const items = [...products];
        switch (sortOption) {
            case 'Name: A-Z': return items.sort((a, b) => a.name.localeCompare(b.name));
            case 'Name: Z-A': return items.sort((a, b) => b.name.localeCompare(a.name));
            case 'Price: Low to High': return items.sort((a, b) => a.price2 - b.price2);
            case 'Price: High to Low': return items.sort((a, b) => b.price2 - a.price2);
            case 'Stock: Low to High': return items.sort((a, b) => a.stock - b.stock);
            case 'Stock: High to Low': return items.sort((a, b) => b.stock - a.stock);
            default: return items;
        }
    };

    const getFilteredRestockProducts = () => {
        if (!products) return [];
        let list = [...products];
        if (restockStockLevel === 'Low Stock') list = list.filter(p => p.stock > 0 && p.stock <= (p.alert_limit || 5));
        else if (restockStockLevel === 'No Stock') list = list.filter(p => p.stock === 0);
        return list;
    };

    return {
        // Data
        products, categories, variantOptions, loading,
        DEFAULT_PLACEHOLDER_IMAGE,
        // Derived
        sortedProducts: getSortedProducts(),
        restockProducts: getFilteredRestockProducts(),
        restockItemsCount, restockUnitsCount,
        // View mode
        viewMode, switchToRestock, switchToProductsList,
        // List filters
        search, setSearch, categoryId, setCategoryId,
        statusFilter, setStatusFilter, sortOption, setSortOption,
        // Restock filters & state
        restockSearch, setRestockSearch, restockCategory, setRestockCategory,
        restockStockLevel, setRestockStockLevel,
        restockQuantities, updateRestockQty, handleClearAllRestock,
        restockDate, setRestockDate, restockTime, setRestockTime, restockVerifiedBy,
        // Restock actions
        handleExitRestockAttempt, handleSaveDraftAndExit, handleDiscardDraftAndExit, handleConfirmRestock,
        // Modals
        showAddModal, setShowAddModal,
        showEditModal, setShowEditModal,
        showDamageModal, setShowDamageModal,
        showViewModal, setShowViewModal,
        showReviewRestockModal, setShowReviewRestockModal,
        showLeaveConfirmModal, setShowLeaveConfirmModal,
        // Form
        selectedProduct, setSelectedProduct,
        formData, setFormData,
        damageQty, setDamageQty,
        damageReason, setDamageReason,
        errorMessage, setErrorMessage,
        successMessage, setSuccessMessage,
        resetForm,
        // Handlers
        handleAddProduct, handleEditProduct, handleDamageSubmit, handleDeleteProduct, handleToggleStatus,
        handleAddressChange, handleImageUpload,
        openEdit, openDamage, openView,
    };
}



