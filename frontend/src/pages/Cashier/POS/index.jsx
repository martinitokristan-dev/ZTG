import React from 'react';
import usePOS from './hooks/usePOS';
import ProductGrid from './views/ProductGrid';
import CartSidebar from './views/CartSidebar';
import CheckoutModal from './modals/CheckoutModal';

export default function POS() {
    const pos = usePOS();

    return (
        <div className="main-workspace-outer">

            <div className="main-workspace">
                <div className="top-bar" style={{ borderBottom: '1px solid var(--border)', padding: '24px 88px 24px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#FFFFFF', height: 'auto' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)' }}>Point of Sale (POS)</h1>
                        <div className="page-description" style={{ marginTop: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>Process cashier sales immediately. Verify inventory and process change calculations.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>                    </div>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: '20px', flex: 1, minHeight: 0, overflow: 'hidden', padding: '20px', background: '#F8FAFC' }}>
                        {/* Left Column: Catalogue */}
                        <ProductGrid 
                            products={pos.products}
                            loading={pos.loadingProducts}
                            categories={pos.categories}
                            searchQuery={pos.searchQuery}
                            setSearchQuery={pos.setSearchQuery}
                            categoryFilter={pos.categoryFilter}
                            setCategoryFilter={pos.setCategoryFilter}
                            addToCart={pos.addToCart}
                            fmt={pos.fmt}
                        />

                        {/* Right Column: Cart Sidebar */}
                        <CartSidebar 
                            cart={pos.cart}
                            updateCartQty={pos.updateCartQty}
                            removeFromCart={pos.removeFromCart}
                            updateCartItemPriceTier={pos.updateCartItemPriceTier}
                            clearCart={pos.clearCart}
                            cartTotals={pos.cartTotals}
                            
                            existingCustomerSearch={pos.existingCustomerSearch}
                            setExistingCustomerSearch={pos.setExistingCustomerSearch}
                            newCustomerName={pos.newCustomerName}
                            setNewCustomerName={pos.setNewCustomerName}
                            customerPhone={pos.customerPhone}
                            setCustomerPhone={pos.setCustomerPhone}
                            customerTin={pos.customerTin}
                            setCustomerTin={pos.setCustomerTin}
                            customerAddress={pos.customerAddress}
                            setCustomerAddress={pos.setCustomerAddress}
                            
                            customersList={pos.customersList}
                            
                            setShowCheckoutModal={pos.setShowCheckoutModal}
                            fmt={pos.fmt}
                        />
                    </div>
                </div>
            </div>

            <CheckoutModal 
                isOpen={pos.showCheckoutModal}
                onClose={() => pos.setShowCheckoutModal(false)}
                cart={pos.cart}
                cartTotals={pos.cartTotals}
                processCheckout={pos.processCheckout}
                fmt={pos.fmt}
            />
        </div>
    );
}
