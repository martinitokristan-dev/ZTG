import React from 'react';
import useProductManagement from './hooks/useProductManagement';
import ProductsTable from './ProductsTable';
import RestockView from './RestockView';
import ProductFormModal from './modals/ProductFormModal';
import ViewProductModal from './modals/ViewProductModal';
import DamageLogModal from './modals/DamageLogModal';
import ReviewRestockModal from './modals/ReviewRestockModal';
import LeaveRestockModal from './modals/LeaveRestockModal';
import { flattenToSellableSKUs } from '../../../shared/utils/skuHelpers';

function ProductManagement() {
    const pm = useProductManagement();

    return (
        <div className="main-workspace-outer">
            {/* Sidebar */}

            {/* Main Workspace */}
            <div className="main-workspace">

                {/* Top Bar */}
                <div className="top-bar">
                    <div>
                        <h1 style={{ fontSize: '20px', marginBottom: '2px' }}>
                            {pm.viewMode === 'list' ? 'Product Management' : 'Inventory Restock'}
                        </h1>
                        <div className="page-description" style={{ marginTop: 0, fontSize: '12px' }}>
                            {pm.viewMode === 'list'
                                ? 'Add, edit, restock, and manage all products in your system.'
                                : 'Batch restock items and confirm with supervisor verification.'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {pm.viewMode === 'list' ? (
                            <>
                                <button onClick={pm.switchToRestock} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Restock
                                </button>
                                <button onClick={() => { pm.resetForm(); pm.setShowAddModal(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
                                        <path d="M12 4v16m-8-8h16" />
                                    </svg>
                                    + Add Product
                                </button>
                            </>
                        ) : (
                            <button onClick={pm.handleExitRestockAttempt} className="btn btn-secondary">
                                ← Back to Products
                            </button>
                        )}                    </div>
                </div>

                {/* Content Body */}
                <div className="content-body">

                    {/* VIEW 1: Products List */}
                    {pm.viewMode === 'list' && (
                        <ProductsTable
                            products={pm.sortedProducts.filter(p => !p.parent_product_id)}
                            loading={pm.loading}
                            categories={pm.categories}
                  variantOptions={pm.variantOptions}
                            search={pm.search} setSearch={pm.setSearch}
                            categoryId={pm.categoryId} setCategoryId={pm.setCategoryId}
                            statusFilter={pm.statusFilter} setStatusFilter={pm.setStatusFilter}
                            sortOption={pm.sortOption} setSortOption={pm.setSortOption}
                            DEFAULT_PLACEHOLDER_IMAGE={pm.DEFAULT_PLACEHOLDER_IMAGE}
                            onView={pm.openView}
                            onEdit={pm.openEdit}
                            onDamage={pm.openDamage}
                            onDelete={pm.handleDeleteProduct}
                            onRestock={(p) => { pm.switchToRestock(); pm.updateRestockQty(p.id, 1); }}
                            onToggleStatus={pm.handleToggleStatus}
                            successMessage={pm.successMessage}
                            setSuccessMessage={pm.setSuccessMessage}
                        />
                    )}

                    {/* VIEW 2: Batch Restock */}
                    {pm.viewMode === 'restock' && (
                        <RestockView
                            products={flattenToSellableSKUs(pm.restockProducts)}
                            categories={pm.categories}
                  variantOptions={pm.variantOptions}
                            loading={pm.loading}
                            restockSearch={pm.restockSearch} setRestockSearch={pm.setRestockSearch}
                            restockCategory={pm.restockCategory} setRestockCategory={pm.setRestockCategory}
                            restockStockLevel={pm.restockStockLevel} setRestockStockLevel={pm.setRestockStockLevel}
                            restockQuantities={pm.restockQuantities}
                            updateRestockQty={pm.updateRestockQty}
                            handleClearAllRestock={pm.handleClearAllRestock}
                            restockDate={pm.restockDate} setRestockDate={pm.setRestockDate}
                            restockTime={pm.restockTime} setRestockTime={pm.setRestockTime}
                            restockVerifiedBy={pm.restockVerifiedBy}
                            restockItemsCount={pm.restockItemsCount}
                            restockUnitsCount={pm.restockUnitsCount}
                            onExit={pm.handleExitRestockAttempt}
                            onReview={() => pm.setShowReviewRestockModal(true)}
                            DEFAULT_PLACEHOLDER_IMAGE={pm.DEFAULT_PLACEHOLDER_IMAGE}
                        />
                    )}
                </div>
            </div>

            {/* ── Modals ── */}

            {/* Add Product */}
            <ProductFormModal
                isOpen={pm.showAddModal}
                mode="add"
                onClose={() => pm.setShowAddModal(false)}
                onSubmit={pm.handleAddProduct}
                formData={pm.formData} setFormData={pm.setFormData}
                categories={pm.categories}
                  variantOptions={pm.variantOptions}
                handleAddressChange={pm.handleAddressChange}
                handleImageUpload={pm.handleImageUpload}
                errorMessage={pm.errorMessage}
            />

            {/* Edit Product */}
            <ProductFormModal
                isOpen={pm.showEditModal}
                mode="edit"
                onClose={() => pm.setShowEditModal(false)}
                onSubmit={pm.handleEditProduct}
                formData={pm.formData} setFormData={pm.setFormData}
                categories={pm.categories}
                  variantOptions={pm.variantOptions}
                handleAddressChange={pm.handleAddressChange}
                handleImageUpload={pm.handleImageUpload}
                errorMessage={pm.errorMessage}
                selectedProduct={pm.selectedProduct}
            />

            {/* View Product */}
            <ViewProductModal
                isOpen={pm.showViewModal}
                onClose={() => pm.setShowViewModal(false)}
                product={pm.selectedProduct}
                DEFAULT_PLACEHOLDER_IMAGE={pm.DEFAULT_PLACEHOLDER_IMAGE}
            />

            {/* Log Damaged */}
            <DamageLogModal
                isOpen={pm.showDamageModal}
                onClose={() => pm.setShowDamageModal(false)}
                onSubmit={pm.handleDamageSubmit}
                product={pm.selectedProduct}
                damageQty={pm.damageQty} setDamageQty={pm.setDamageQty}
                damageReason={pm.damageReason} setDamageReason={pm.setDamageReason}
                errorMessage={pm.errorMessage}
            />

            {/* Review Restock */}
            <ReviewRestockModal
                isOpen={pm.showReviewRestockModal}
                onClose={() => pm.setShowReviewRestockModal(false)}
                onConfirm={pm.handleConfirmRestock}
                products={pm.products}
                restockQuantities={pm.restockQuantities}
                restockItemsCount={pm.restockItemsCount}
                restockUnitsCount={pm.restockUnitsCount}
                restockVerifiedBy={pm.restockVerifiedBy}
                restockDate={pm.restockDate}
                restockTime={pm.restockTime}
                errorMessage={pm.errorMessage}
                DEFAULT_PLACEHOLDER_IMAGE={pm.DEFAULT_PLACEHOLDER_IMAGE}
            />

            {/* Leave Restock Confirm */}
            <LeaveRestockModal
                isOpen={pm.showLeaveConfirmModal}
                onClose={() => pm.setShowLeaveConfirmModal(false)}
                onSaveDraft={pm.handleSaveDraftAndExit}
                onDiscard={pm.handleDiscardDraftAndExit}
            />
        </div>
    );
}

export default ProductManagement;

