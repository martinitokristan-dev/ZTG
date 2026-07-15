import assert from 'assert';
import { flattenToSellableSKUs } from './skuHelpers.js';

// Fixture
const mockProducts = [
    // 1. Parent with variants and stock > 0 (ZTG Hydraulic Pump)
    {
        id: 1,
        parent_product_id: null,
        name: 'ZTG Hydraulic Pump',
        part_no: 'HP-PUMP-1783781307',
        stock: 80,
        price1: 2500,
        price2: 2750,
        variants: [
            {
                id: 2,
                parent_product_id: 1,
                name: 'ZTG Hydraulic Pump - Medium Yellow',
                part_no: 'HP-PUMP-1783781307-MY',
                stock: 47,
                price1: 2500,
                price2: 2750,
                variant_options: [{ value: 'Medium' }, { value: 'Yellow' }]
            }
        ]
    },
    // 2. Parent with variants and stock = 0
    {
        id: 10,
        parent_product_id: null,
        name: 'Heavy Duty Alternator',
        part_no: 'ALT-HD',
        stock: 0,
        price1: 4000,
        price2: 4500,
        variants: [
            {
                id: 11,
                parent_product_id: 10,
                name: 'Heavy Duty Alternator - 24V',
                part_no: 'ALT-HD-24V',
                stock: 5,
                price1: 4200,
                price2: 4700,
                variant_options: [{ value: '24V' }]
            }
        ]
    },
    // 3. Parent with no variants
    {
        id: 20,
        parent_product_id: null,
        name: 'Engine Gasket Set',
        part_no: 'EGS-999',
        stock: 12,
        price1: 1500,
        price2: 1700,
        variants: []
    }
];

function runTests() {
    console.log("--------------------------------------------------");
    console.log("RUNNING FRONTEND SKU UTILITY TEST SUITE");
    console.log("--------------------------------------------------");

    const sellable = flattenToSellableSKUs(mockProducts);
    const ids = sellable.map(item => item.id);

    // Case 1: Parent with no variants
    console.log("Case 1: Checking parent with no variants (ID 20)...");
    assert.ok(ids.includes(20), "FAIL: Engine Gasket Set (ID 20) should be included");
    assert.strictEqual(sellable.find(item => item.id === 20).stock, 12, "FAIL: Correct stock for ID 20 should be mapped");
    console.log("  -> SUCCESS: Parent with no variants is included correctly.");

    // Case 2: Parent with variants and stock > 0 (ZTG Hydraulic Pump)
    console.log("Case 2: Checking parent with variants and stock > 0 (ID 1)...");
    assert.ok(ids.includes(1), "FAIL: Parent ZTG Hydraulic Pump (ID 1) should be included");
    assert.strictEqual(sellable.find(item => item.id === 1).stock, 80, "FAIL: Correct stock for ID 1 should be mapped");
    console.log("  -> SUCCESS: Parent with variants and stock > 0 is included correctly.");

    // Case 3: Parent with variants and stock = 0 (Excluded)
    console.log("Case 3: Checking parent with variants and stock = 0 (ID 10)...");
    assert.ok(!ids.includes(10), "FAIL: Parent Heavy Duty Alternator (ID 10) with stock=0 should be excluded");
    console.log("  -> SUCCESS: Parent with variants and stock = 0 is excluded correctly.");

    // Case 4: Variant rows (Included)
    console.log("Case 4: Checking nested variant rows (ID 2 & ID 11)...");
    assert.ok(ids.includes(2), "FAIL: Variant (ID 2) should be included");
    assert.ok(ids.includes(11), "FAIL: Variant (ID 11) should be included");
    
    // Verify Display Names formatting
    const pumpVariant = sellable.find(item => item.id === 2);
    assert.strictEqual(pumpVariant.displayName, "ZTG Hydraulic Pump - Medium Yellow (Medium, Yellow)", "FAIL: Variant displayName not formatted correctly");
    console.log("  -> SUCCESS: Nested variant rows are included and formatted correctly.");

    console.log("--------------------------------------------------");
    console.log("ALL FRONTEND SKU UTILITY TEST CASES PASSED");
    console.log("--------------------------------------------------");
}

runTests();
