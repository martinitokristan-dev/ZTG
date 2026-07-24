/**
 * Flattens a list of products (which contains parent products and nested variants)
 * into a flat list of sellable SKUs.
 *
 * Rules:
 * 1. A parent product (parent_product_id IS NULL) is included if it has no variants
 *    OR if it has variants and its own stock is > 0.
 * 2. All variant products (either present flat at the root level or nested inside a parent product)
 *    are included.
 *
 * @param {Array} products - List of parent products (possibly with nested variants)
 * @returns {Array} - List of sellable SKUs (flat)
 */
export function flattenToSellableSKUs(products) {
    if (!Array.isArray(products)) return [];
    
    const sellableMap = new Map();

    products.forEach(p => {
        if (!p) return;

        // Determine if it's a parent or variant
        const isParent = !p.parent_product_id;

        if (isParent) {
            // Include parent if:
            // - It has no variants
            // - OR it has variants but parent itself has stock > 0
            const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
            if (!hasVariants || p.stock > 0) {
                // To avoid duplicate entries if a product has both parent and variant models in the list
                sellableMap.set(p.id, {
                    ...p,
                    displayName: p.name,
                    sku: p.part_no || p.partNo || 'N/A'
                });
            }
        } else {
            // Include variant
            const optionValues = Array.isArray(p.variant_options)
                ? p.variant_options.map(opt => opt.value).join(', ')
                : (Array.isArray(p.variantOptions) ? p.variantOptions.map(opt => opt.value).join(', ') : '');
            
            const displayName = optionValues && !p.name.includes(`(${optionValues})`)
                ? `${p.name} (${optionValues})`
                : p.name;

            sellableMap.set(p.id, {
                ...p,
                name: displayName,
                displayName,
                chinese_name: p.chinese_name || null,
                sku: p.part_no || p.partNo || 'N/A'
            });
        }

        // Also process any nested variants under the parent product
        if (Array.isArray(p.variants) && p.variants.length > 0) {
            p.variants.forEach(v => {
                if (!v) return;
                
                const optionValues = Array.isArray(v.variant_options)
                    ? v.variant_options.map(opt => opt.value).join(', ')
                    : (Array.isArray(v.variantOptions) ? v.variantOptions.map(opt => opt.value).join(', ') : '');

                const displayName = optionValues && !v.name.includes(`(${optionValues})`)
                    ? `${v.name || p.name} (${optionValues})`
                    : (v.name || p.name);

                sellableMap.set(v.id, {
                    ...v,
                    name: displayName,
                    displayName,
                    chinese_name: v.chinese_name || p.chinese_name || null,
                    sku: v.part_no || v.partNo || 'N/A'
                });
            });
        }
    });

    return Array.from(sellableMap.values());
}
