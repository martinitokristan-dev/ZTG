import React from 'react';
import useSettings from './hooks/useSettings';

import ProfileTab from './tabs/ProfileTab';
import GeneralTab from './tabs/GeneralTab';
import ProductsTab from './tabs/ProductsTab';
import AlertsTab from './tabs/AlertsTab';
import EmployeesTab from './tabs/EmployeesTab';

import CategoryModal from './modals/CategoryModal';
import EmployeeModal from './modals/EmployeeModal';
import PasswordModal from './modals/PasswordModal';
import RuleModal from './modals/RuleModal';

export default function Settings() {
    const {
        loading, isProfileDirty, isSettingsDirty, notificationsCount,
        activeTab, setActiveTab, activeSubTab, setActiveSubTab, activeAlertsSubTab, setActiveAlertsSubTab,
        profileData, setProfileData, passwordData, setPasswordData, showPasswordModal, setShowPasswordModal, showPIN, setShowPIN,
        settings, handleSettingInputChange, handleToggleSetting, handleSaveBulkSettings,
        categories, showCategoryModal, setShowCategoryModal, selectedCategory, setSelectedCategory, categoryName, setCategoryName,
        categoryVariants, setCategoryVariants,
        newOptionValue, setNewOptionValue,
        alertRules, showRuleModal, setShowRuleModal, ruleForm, setRuleForm,
        employees, showEmployeeModal, setShowEmployeeModal, employeeForm, setEmployeeForm, selectedEmployee, setSelectedEmployee,
        handleProfileSubmit, handlePasswordSubmit, handleCategorySubmit, handleDeleteCategory, handleAddVariantOption, handleUpdateVariantOption, handleDeleteVariantOption, getOptionsForType,
        handleRuleSubmit, handleToggleRule, handleDeleteRule,
        handleEmployeeSubmit, openEditEmployee, handleToggleEmployee, openAddEmployee
    } = useSettings();

    const isCashier = profileData?.role === 'Cashier';

    // Force active tab to profile if cashier
    React.useEffect(() => {
        if (isCashier && activeTab !== 'profile') {
            setActiveTab('profile');
        }
    }, [isCashier, activeTab, setActiveTab]);

    return (
        <div className="main-workspace-outer">

            <div className="main-workspace">
                <div className="top-bar">
                    <div>
                        <h1 id="settingsPageTitle" style={{fontSize: '20px', marginBottom: '2px'}}>System Settings</h1>
                        <div id="settingsPageDesc" className="page-description" style={{marginTop: 0, fontSize: '12px'}}>
                            {isCashier ? 'Manage your personal details, photo, and account security.' : 'Configure inventory thresholds, categories, alerts, and employee access.'}
                        </div>
                    </div>
                    <div className="top-bar-actions">                    </div>
                </div>

                <div className="content-body settings-page-body" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                    <div className="settings-tabs-wrap">
                        {/* Navigation Tabs Header (Hidden for Cashiers) */}
                        {!isCashier && (
                            <div className="tabs-header">
                                {[
                                    { id: 'profile', label: 'My Profile' },
                                    { id: 'general', label: 'General' },
                                    { id: 'products', label: 'Products Settings' },
                                    { id: 'alerts', label: 'Alerts & Notifications' },
                                    { id: 'employees', label: 'Employee\'s role' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TAB CONTENTS */}
                        <div className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
                            {activeTab === 'profile' && (
                                <ProfileTab 
                                    profileData={profileData} setProfileData={setProfileData} handleProfileSubmit={handleProfileSubmit}
                                    setShowPasswordModal={setShowPasswordModal} showPIN={showPIN} setShowPIN={setShowPIN} isProfileDirty={isProfileDirty}
                                />
                            )}
                        </div>

                        {!isCashier && (
                            <>
                                <div className={`tab-content ${activeTab === 'general' ? 'active' : ''}`}>
                                    {activeTab === 'general' && (
                                        <GeneralTab 
                                            settings={settings} handleSettingInputChange={handleSettingInputChange} handleToggleSetting={handleToggleSetting} handleSaveBulkSettings={handleSaveBulkSettings}
                                        />
                                    )}
                                </div>

                                <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
                                    {activeTab === 'products' && (
                                        <ProductsTab 
                                            activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} settings={settings} handleSettingInputChange={handleSettingInputChange} handleToggleSetting={handleToggleSetting}
                                            categories={categories} setSelectedCategory={setSelectedCategory} setCategoryName={setCategoryName} setShowCategoryModal={setShowCategoryModal} handleDeleteCategory={handleDeleteCategory} setCategoryVariants={setCategoryVariants}
                                            newOptionValue={newOptionValue} setNewOptionValue={setNewOptionValue} handleAddVariantOption={handleAddVariantOption} handleUpdateVariantOption={handleUpdateVariantOption} handleDeleteVariantOption={handleDeleteVariantOption} getOptionsForType={getOptionsForType}
                                            handleSaveBulkSettings={handleSaveBulkSettings}
                                        />
                                    )}
                                </div>

                                <div className={`tab-content ${activeTab === 'alerts' ? 'active' : ''}`}>
                                    {activeTab === 'alerts' && (
                                        <AlertsTab 
                                            activeAlertsSubTab={activeAlertsSubTab} setActiveAlertsSubTab={setActiveAlertsSubTab} settings={settings} handleSettingInputChange={handleSettingInputChange} handleToggleSetting={handleToggleSetting}
                                            alertRules={alertRules} setShowRuleModal={setShowRuleModal} handleToggleRule={handleToggleRule} handleDeleteRule={handleDeleteRule} handleSaveBulkSettings={handleSaveBulkSettings}
                                        />
                                    )}
                                </div>

                                <div className={`tab-content ${activeTab === 'employees' ? 'active' : ''}`}>
                                    {activeTab === 'employees' && (
                                        <EmployeesTab 
                                            employees={employees} openEditEmployee={openEditEmployee} openAddEmployee={openAddEmployee} handleToggleEmployee={handleToggleEmployee}
                                            setSelectedEmployee={setSelectedEmployee} setEmployeeForm={setEmployeeForm} setShowEmployeeModal={setShowEmployeeModal}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Global Action Buttons */}
                    {activeTab !== 'profile' && (
                        <div className="settings-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button type="button" className="btn btn-secondary" disabled>Cancel Changes</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveBulkSettings} disabled={!isSettingsDirty}>Save Settings</button>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                <CategoryModal 
                    showCategoryModal={showCategoryModal} setShowCategoryModal={setShowCategoryModal}
                    selectedCategory={selectedCategory} categoryName={categoryName} setCategoryName={setCategoryName}
                    categoryVariants={categoryVariants} setCategoryVariants={setCategoryVariants}
                    getOptionsForType={getOptionsForType}
                    handleCategorySubmit={handleCategorySubmit}
                />
                <EmployeeModal 
                    showEmployeeModal={showEmployeeModal} setShowEmployeeModal={setShowEmployeeModal}
                    selectedEmployee={selectedEmployee} employeeForm={employeeForm} setEmployeeForm={setEmployeeForm}
                    handleEmployeeSubmit={handleEmployeeSubmit}
                />
                <PasswordModal 
                    showPasswordModal={showPasswordModal} setShowPasswordModal={setShowPasswordModal}
                    passwordData={passwordData} setPasswordData={setPasswordData} handlePasswordSubmit={handlePasswordSubmit}
                />
                <RuleModal 
                    showRuleModal={showRuleModal} setShowRuleModal={setShowRuleModal}
                    ruleForm={ruleForm} setRuleForm={setRuleForm} handleRuleSubmit={handleRuleSubmit}
                />
            </div>
        </div>
    );
}


