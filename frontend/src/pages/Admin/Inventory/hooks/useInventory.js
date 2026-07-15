import { useState, useMemo } from 'react';
import api from '../../../../shared/api';
import { useInventory as useGlobalInventory } from '../../../../contexts/InventoryContext';
import { useProducts as useGlobalProducts } from '../../../../contexts/ProductContext';
import { flattenToSellableSKUs } from '../../../../shared/utils/skuHelpers';

export function useInventory() {
    // Read from global contexts (zero-fetch page load/filtering)
    const { inventory: globalProducts } = useGlobalInventory();
    const { categories } = useGlobalProducts();

    const loading = globalProducts.length === 0;

    // Filters state
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // Apply filters client-side
    const filteredProducts = useMemo(() => {
        let list = globalProducts || [];

        if (categoryId) {
            list = list.filter(p => p.category_id === parseInt(categoryId, 10));
        }

        if (statusFilter) {
            if (statusFilter === 'Dead Stock') {
                list = list.filter(p => p.is_dead_stock);
            } else {
                list = list.filter(p => p.status?.toLowerCase() === statusFilter.toLowerCase());
            }
        }

        if (search.trim() !== '') {
            const q = search.toLowerCase();
            list = list.filter(p =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.part_no || p.partNo || '').toLowerCase().includes(q) ||
                (p.chinese_name || '').toLowerCase().includes(q)
            );
        }

        return list;
    }, [globalProducts, search, categoryId, statusFilter]);

    // View Product details
    const handleViewProduct = async (product) => {
        try {
            // Find locally first to populate immediately
            const local = globalProducts.find(p => p.id === product.id);
            if (local) setSelectedProduct(local);

            // Fetch detail from backend to get fresh database state
            const res = await api.get(`/products/${product.id}`);
            setSelectedProduct(res.data);
            setShowViewModal(true);
        } catch (err) {
            console.error('Failed to fetch product details:', err);
        }
    };

    const filteredSKUs = useMemo(() => {
        return flattenToSellableSKUs(filteredProducts);
    }, [filteredProducts]);

    const totalItems = filteredSKUs.length;
    const categoriesCount = new Set(filteredSKUs.map(p => p.category_id)).size;
    const outOfStockCount = filteredSKUs.filter(p => p.stock === 0).length;
    const lowStockCount = filteredSKUs.filter(p => p.stock > 0 && p.stock <= (p.alert_limit || 5)).length;

    return {
        products: filteredProducts,
        categories,
        loading,
        search, setSearch,
        categoryId, setCategoryId,
        statusFilter, setStatusFilter,
        selectedProduct, setSelectedProduct,
        showViewModal, setShowViewModal,
        handleViewProduct,
        totalItems,
        categoriesCount,
        outOfStockCount,
        lowStockCount
    };
}
