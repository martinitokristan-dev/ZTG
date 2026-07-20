import { showToast } from '../../../../utils/toast';
import { useState, useEffect } from 'react';
import api from '../../../../shared/api';
import { useProducts } from '../../../../contexts/ProductContext';
import { fetchSettingData, resetSettingsCache } from '../../../../shared/hooks/useSettingsCache';
import { resetDashboardCache } from '../../../../shared/hooks/useDashboardCache';

export default function useSettings() {
    const [loading, setLoading] = useState(false);
    

    // Primary Active Tab: 'profile', 'general', 'products', 'alerts', 'employees'
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('settingsActiveTab') || 'profile');

    useEffect(() => {
        localStorage.setItem('settingsActiveTab', activeTab);
    }, [activeTab]);

    // Products Settings Nested Sub-tab: 'info', 'categories', 'sizes', 'quality', 'colors', 'pricing', 'warehouse'
    const [activeSubTab, setActiveSubTab] = useState('info');

    // Alerts Settings Nested Sub-tab: 'inventory', 'transaction', 'reservation', 'email', 'rules'
    const [activeAlertsSubTab, setActiveAlertsSubTab] = useState('inventory');

    // ------------------------------------------------------------------------
    // TAB 1: MY PROFILE STATE
    // ------------------------------------------------------------------------
    const [profileData, setProfileData] = useState({
        name: '',
        real_name: '',
        email: '',
        username: '',
        pin: '',
        role: 'Administrator',
        profile_photo: null
    });
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [confirmingRemove, setConfirmingRemove] = useState(false);
    const [initialProfileData, setInitialProfileData] = useState({});
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPIN, setShowPIN] = useState(false);

    // ------------------------------------------------------------------------
    // TAB 2: GENERAL SETTINGS STATE & BULK SETTINGS
    // ------------------------------------------------------------------------
    const [settings, setSettings] = useState({
        business_name: 'ZTG Heavy Parts',
        branch_location: 'Butuan City',
        contact_number: '09XX-XXX-XXXX',
        email_address: 'info@ztgheavyparts.com',
        tax_rate: '12',
        currency: 'PHP',
        low_stock_threshold: '5',
        dead_stock_period: '90',
        auto_deduct_stock: 'true',
        track_damaged_separately: 'true',
        track_damaged: 'true', // Synced
        // Product Info toggles
        display_chinese_names: 'true',
        enable_product_variants: 'true',
        enable_variants: 'true', // Synced
        enable_dual_pricing: 'true',
        track_warehouse_locations: 'true',
        track_locations: 'true', // Synced
        // Pricing Configuration
        price1_label: 'Original Price',
        price2_label: 'Retail Price',
        auto_calc_price2: 'true',
        price2_markup_percent: '10',
        price2_markup: '10', // Synced
        // Warehouse & Display
        location_format: 'Aisle-Center-Hang (A-12-3)',
        number_of_aisles: '15',
        always_display_part_numbers: 'false',
        show_stock_levels_pos: 'true',
        hide_oos_pos: 'false',
        // Authorization & Limit Settings
        daily_void_limit: '5',
        // Alerts Tab settings
        enable_stock_alerts_checkbox: 'true',
        send_low_stock_alerts: 'true',
        send_oos_alerts: 'true',
        send_dead_stock_alerts: 'true',
        send_damaged_alerts: 'true',
        show_alerts_on_dashboard: 'true',
        // Transaction Alerts settings
        notify_po_awaiting_approval: 'true',
        notify_po_approved: 'true',
        notify_po_rejected: 'true',
        send_refund_alerts: 'true',
        send_large_sales_alerts: 'false',
        // Reservation Alerts settings
        send_reservation_expiring_alerts: 'true',
        send_reservation_expired_alerts: 'true',
        // Email & Reports settings
        enable_email_notifications: 'true',
        admin_email_address: 'admin@ztgheavyparts.com',
        additional_email_recipients: 'email1@example.com, email2@example.com',
        send_daily_sales_report: 'false',
        send_weekly_inventory_report: 'false',
        send_monthly_performance_report: 'false'
    });
    const [initialSettings, setInitialSettings] = useState({});

    // ------------------------------------------------------------------------
    // TAB 3: PRODUCTS SETTINGS DATA (Categories & Variants)
    // ------------------------------------------------------------------------
    const { categories: contextCategories, optimisticUpdateCategory, optimisticDeleteCategory, refetch: refetchCategories } = useProducts();
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryVariants, setCategoryVariants] = useState([]);

    // Variants options
    const [variantTypes, setVariantTypes] = useState([]);
    const [newOptionValue, setNewOptionValue] = useState('');

    // ------------------------------------------------------------------------
    // TAB 4: ALERTS RULES STATE
    // ------------------------------------------------------------------------
    const [alertRules, setAlertRules] = useState([]);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [ruleForm, setRuleForm] = useState({
        name: '',
        event_type: 'low_stock',
        threshold: 5,
        is_active: true
    });

    // ------------------------------------------------------------------------
    // TAB 5: EMPLOYEES STATE
    // ------------------------------------------------------------------------
    const [employeeRoles, setEmployeeRoles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        real_name: '',
        email: '',
        username: '',
        password: '',
        pin: '',
        employee_id: '', role: 'Cashier', status: 'Active' });
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // ------------------------------------------------------------------------
    // TAB 6: CHECKERS STATE
    // ------------------------------------------------------------------------
    const [checkers, setCheckers] = useState([]);
    const [showCheckerModal, setShowCheckerModal] = useState(false);
    const [checkerForm, setCheckerForm] = useState({ name: '', status: 'Active' });
    const [selectedChecker, setSelectedChecker] = useState(null);

    // Load initial context
    const loadSettingsData = async () => {
        try {
            setLoading(true);
            
            // Load user profile
            const userData = await fetchSettingData('user', '/user');
            if (userData) {
                const u = userData.user || userData;
                const loadedProfile = {
                    name: u.username || '',
                    real_name: u.real_name || '',
                    email: u.email || '',
                    username: u.username || '',
                    pin: u.pin || '',
                    role: u.role || (localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')).role : 'Cashier'),
                    profile_photo: u.profile_photo || null
                };
                setProfileData(loadedProfile);
                setInitialProfileData(loadedProfile);
            }

            // Load bulk system settings
            const settingsData = await fetchSettingData('settings', '/settings');
            if (settingsData) {
                setSettings(prev => {
                    const next = { ...prev, ...settingsData };
                    setInitialSettings(next);
                    return next;
                });
            }

            // Load nested assets
            loadCategories();
            loadVariants();
            loadAlertRules();
            loadEmployees();
            loadCheckers();
        } catch (err) {
            showToast('Failed to load system settings configurations.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        setCategories(contextCategories);
    };

    useEffect(() => {
        setCategories(contextCategories);
    }, [contextCategories]);

    const loadVariants = async () => {
        try {
            const data = await fetchSettingData('variants', '/variants');
            setVariantTypes(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadAlertRules = async () => {
        try {
            const data = await fetchSettingData('alertRules', '/alert-rules');
            setAlertRules(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadEmployees = async () => {
        try {
            const data = await fetchSettingData('employees', '/employees');
            setEmployees(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadCheckers = async () => {
        try {
            const data = await fetchSettingData('checkers', '/checkers');
            setCheckers(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadSettingsData();
    }, []);

    // ------------------------------------------------------------------------
    // TAB 1 ACTIONS: PROFILE UPDATES
    // ------------------------------------------------------------------------
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        // Validate required fields
        if (!profileData.real_name?.trim() || !profileData.email?.trim() || !profileData.username?.trim()) {
            showToast('Please fill in all required profile fields: Full Name, Email, and Username.', 'error');
            return;
        }
        try {
            const res = await api.put('/profile', {
                name: profileData.username,
                real_name: profileData.real_name,
                email: profileData.email,
                username: profileData.username,
                pin: profileData.pin
            });
            if (res.data) {
                localStorage.setItem('auth_user', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event('auth_user_updated'));
            }
            resetSettingsCache('user');
            showToast('Profile information updated successfully!', 'success');
            setInitialProfileData(profileData);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error occurred while saving profile.', 'error');
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newUrl = res.data.profile_photo;
            setProfileData(prev => ({ ...prev, profile_photo: newUrl }));
            setInitialProfileData(prev => ({ ...prev, profile_photo: newUrl }));
            const stored = localStorage.getItem('auth_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem('auth_user', JSON.stringify({ ...parsed, profile_photo: newUrl }));
                window.dispatchEvent(new Event('auth_user_updated'));
            }
            resetSettingsCache('user');
            showToast('Profile photo updated successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to upload photo. Max 2MB, images only.', 'error');
        } finally {
            setAvatarUploading(false);
            // Reset input so the same file can be re-selected
            e.target.value = '';
        }
    };

    const handleAvatarRemove = () => {
        setConfirmingRemove(true);
    };

    const handleAvatarRemoveConfirmed = async () => {
        setConfirmingRemove(false);
        setAvatarUploading(true);
        try {
            await api.delete('/profile/avatar');
            setProfileData(prev => ({ ...prev, profile_photo: null }));
            setInitialProfileData(prev => ({ ...prev, profile_photo: null }));
            const stored = localStorage.getItem('auth_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem('auth_user', JSON.stringify({ ...parsed, profile_photo: null }));
                window.dispatchEvent(new Event('auth_user_updated'));
            }
            resetSettingsCache('user');
            showToast('Profile photo removed.', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to remove photo.', 'error');
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleAvatarRemoveCancel = () => {
        setConfirmingRemove(false);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            
            
            await api.put('/profile/password', passwordData);
            showToast('Password changed successfully!', 'success');
            setShowPasswordModal(false);
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update login password.', 'error');
        }
    };

    // ------------------------------------------------------------------------
    // TAB 2 ACTIONS: SYSTEM BULK SETTINGS
    // ------------------------------------------------------------------------
    const handleSaveBulkSettings = async () => {
        try {
            await api.put('/settings', { settings });
            resetSettingsCache('settings');
            showToast('System settings saved successfully!', 'success');
            setInitialSettings(settings);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update system settings.', 'error');
        }
    };

    const handleToggleSetting = (key) => {
        setSettings(prev => {
            const nextVal = prev[key] === 'true' ? 'false' : 'true';
            const updates = { [key]: nextVal };

            // Sync logic flows alternative keys
            if (key === 'track_damaged_separately') updates.track_damaged = nextVal;
            if (key === 'track_damaged') updates.track_damaged_separately = nextVal;
            if (key === 'enable_product_variants') updates.enable_variants = nextVal;
            if (key === 'enable_variants') updates.enable_product_variants = nextVal;
            if (key === 'track_warehouse_locations') updates.track_locations = nextVal;
            if (key === 'track_locations') updates.track_warehouse_locations = nextVal;

            const next = { ...prev, ...updates };

            // Auto-save after toggle
            setTimeout(async () => {
                try {
                    await api.put('/settings', { settings: next });
                    resetSettingsCache('settings');
                    setInitialSettings(next);
                } catch (err) {
                    showToast('Failed to auto-save setting change.', 'error');
                }
            }, 0);

            return next;
        });
    };

    const handleSettingInputChange = (key, val) => {
        setSettings(prev => {
            const updates = { [key]: val };
            
            // Sync logic flows alternative keys
            if (key === 'price2_markup_percent') updates.price2_markup = val;
            if (key === 'price2_markup') updates.price2_markup_percent = val;
            
            return {
                ...prev,
                ...updates
            };
        });
    };

    // ------------------------------------------------------------------------
    // TAB 3 ACTIONS: CATEGORIES & VARIANTS OPTIONS CRUD
    // ------------------------------------------------------------------------
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        
        let commitFn, rollbackFn;
        if (selectedCategory) {
            const { commit, rollback } = optimisticUpdateCategory(selectedCategory.id, { name: categoryName, variants: categoryVariants });
            commitFn = commit; rollbackFn = rollback;
        } else {
            // New category gets a temp ID
            const { commit, rollback } = optimisticUpdateCategory(Date.now(), { name: categoryName, variants: categoryVariants });
            commitFn = commit; rollbackFn = rollback;
        }

        try {
            if (selectedCategory) {
                await api.put(`/categories/${selectedCategory.id}`, { name: categoryName, variants: categoryVariants });
                showToast('Category updated successfully!', 'success');
            } else {
                await api.post('/categories', { name: categoryName, variants: categoryVariants });
                showToast('New category added successfully!', 'success');
            }
            commitFn();
            setShowCategoryModal(false);
            setCategoryName('');
            setSelectedCategory(null);
            refetchCategories(); // Silent background refetch
        } catch (err) {
            rollbackFn();
            showToast(err.response?.data?.message || 'Failed to save product category.', 'error');
        }
    };

    const handleDeleteCategory = async (cat) => {
        if (!window.confirm(`Are you sure you want to delete ${cat.name}?`)) return;
        const { commit, rollback } = optimisticDeleteCategory(cat.id);
        try {
            await api.delete(`/categories/${cat.id}`);
            commit();
            showToast('Category deleted successfully.', 'success');
            refetchCategories();
        } catch (err) {
            rollback();
            showToast(err.response?.data?.message || 'Category cannot be deleted if associated with products.', 'error');
        }
    };

    const getOrAddVariantOption = async (typeName) => {
        let vType = variantTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());
        if (!vType) {
            try {
                const newTypeRes = await api.post('/variants', { name: typeName });
                vType = newTypeRes.data.variant_type;
                resetSettingsCache('variants');
                await loadVariants();
            } catch (err) {
                console.error('Failed to auto-create variant type: ', err);
                return null;
            }
        }
        return vType;
    };

    const handleAddVariantOption = async (typeName) => {
        if (!newOptionValue.trim()) return;
        try {
            
            
            const vType = await getOrAddVariantOption(typeName);
            if (!vType) {
                showToast('Failed to resolve variant type database node.', 'error');
                return;
            }

            await api.post(`/variants/${vType.id}/options`, { value: newOptionValue.trim() });
            showToast(`Option "${newOptionValue}" added to ${typeName} settings.`, 'success');
            setNewOptionValue('');
            resetSettingsCache('variants');
            loadVariants();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add option.', 'error');
        }
    };

    const handleUpdateVariantOption = async (optId, newValue) => {
        if (!newValue.trim()) return;
        try {
            await api.put(`/variant-options/${optId}`, { value: newValue.trim() });
            showToast('Option updated successfully.', 'success');
            resetSettingsCache('variants');
            loadVariants();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update variant option.', 'error');
        }
    };

    const handleDeleteVariantOption = async (optId) => {
        if (!window.confirm('Are you sure you want to remove this variant option value?')) return;
        try {
            
            
            await api.delete(`/variant-options/${optId}`);
            showToast('Option value deleted successfully.', 'success');
            resetSettingsCache('variants');
            loadVariants();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete variant option value.', 'error');
        }
    };

    const getOptionsForType = (typeName) => {
        const type = variantTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());
        return type ? type.options || [] : [];
    };

    // ------------------------------------------------------------------------
    // TAB 4 ACTIONS: LOW STOCK ALERTS RULES CRUD
    // ------------------------------------------------------------------------
    const handleRuleSubmit = async (e) => {
        e.preventDefault();
        try {
            
            
            await api.post('/alert-rules', ruleForm);
            showToast('Alert rule created successfully.', 'success');
            setShowRuleModal(false);
            setRuleForm({ name: '', event_type: 'low_stock', threshold: 5, is_active: true });
            resetSettingsCache('alertRules');
            loadAlertRules();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save alert rule.', 'error');
        }
    };

    const handleToggleRule = async (rule) => {
        try {
            await api.patch(`/alert-rules/${rule.id}/toggle`);
            resetSettingsCache('alertRules');
            loadAlertRules();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteRule = async (rule) => {
        if (!window.confirm(`Delete alert rule ${rule.name}?`)) return;
        try {
            await api.delete(`/alert-rules/${rule.id}`);
            resetSettingsCache('alertRules');
            loadAlertRules();
        } catch (err) {
            console.error(err);
        }
    };

    // ------------------------------------------------------------------------
    // TAB 5 ACTIONS: EMPLOYEES CRUD
    // ------------------------------------------------------------------------
    const handleEmployeeSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = employeeForm.role;
            let pin = employeeForm.pin;
            
            if (role === 'Cashier' || role === 'Checker') {
                pin = '';
            } else if ((role === 'Admin' || role === 'Supervisor') && (!pin || pin.length !== 4)) {
                showToast('Admin and Supervisor roles require a 4-digit PIN for approvals.', 'error');
                return;
            }

            const submitData = { 
                ...employeeForm, 
                name: employeeForm.real_name,
                username: employeeForm.employee_id, // Map Access ID to username
                pin: pin
            };
            if (selectedEmployee) {
                await api.put(`/employees/${selectedEmployee.id}`, submitData);
                showToast('Employee updated successfully.', 'success');
            } else {
                await api.post('/employees', submitData);
                showToast('Employee added successfully.', 'success');
            }
            setShowEmployeeModal(false);
            setSelectedEmployee(null);
            setEmployeeForm({ name: '', real_name: '', email: '', username: '', password: '', pin: '', employee_id: '', role: 'Cashier', status: 'Active' });
            resetSettingsCache('employees');
            resetDashboardCache();
            loadEmployees();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save employee profile.', 'error');
        }
    };

    const handleToggleEmployee = async (emp) => {
        if (emp.employee_id === 'EMP-000') {
            showToast('Cannot deactivate the default administrator.', 'error');
            return;
        }
        try {
            await api.patch(`/employees/${emp.id}/toggle`);
            resetSettingsCache('employees');
            resetDashboardCache();
            loadEmployees();
        } catch (err) {
            console.error(err);
        }
    };

    const openAddEmployee = () => {
        setSelectedEmployee(null);
        let nextIdNumber = 1;
        if (employees.length > 0) {
            const ids = employees
                .filter(emp => emp.employee_id && emp.employee_id.startsWith('EMP-'))
                .map(emp => parseInt(emp.employee_id.replace('EMP-', '')))
                .filter(num => !isNaN(num));
            if (ids.length > 0) {
                nextIdNumber = Math.max(...ids) + 1;
            }
        }
        const nextId = `EMP-${nextIdNumber.toString().padStart(3, '0')}`;
        
        setEmployeeForm({
            employee_id: nextId,
            name: '', real_name: '', email: '', username: '', password: '', pin: '', employee_id: '', role: 'Cashier', status: 'Active' });
        setShowEmployeeModal(true);
    };

    const openEditEmployee = (emp) => {
        setSelectedEmployee(emp);
        setEmployeeForm({
            employee_id: emp.employee_id,
            name: emp.username,
            real_name: emp.real_name || '',
            email: emp.email,
            username: emp.username,
            password: '', // blank on edit
            pin: emp.pin || '',
            role: emp.role,
            status: emp.status
        });
        setShowEmployeeModal(true);
    };

    // ------------------------------------------------------------------------
    // TAB 6 ACTIONS: CHECKERS CRUD
    // ------------------------------------------------------------------------
    const handleCheckerSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedChecker) {
                await api.put(`/checkers/${selectedChecker.id}`, checkerForm);
                showToast('Checker updated successfully.', 'success');
            } else {
                await api.post('/checkers', checkerForm);
                showToast('Checker added successfully.', 'success');
            }
            setShowCheckerModal(false);
            setSelectedChecker(null);
            setCheckerForm({ name: '', status: 'Active' });
            resetSettingsCache('checkers');
            loadCheckers();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save checker profile.', 'error');
        }
    };

    const openAddChecker = () => {
        setSelectedChecker(null);
        setCheckerForm({ name: '', status: 'Active' });
        setShowCheckerModal(true);
    };

    const openEditChecker = (checker) => {
        setSelectedChecker(checker);
        setCheckerForm({
            name: checker.name,
            status: checker.status
        });
        setShowCheckerModal(true);
    };

    const isProfileDirty = JSON.stringify(profileData) !== JSON.stringify(initialProfileData);
    const isSettingsDirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);

    return {
        // App State
        loading, isProfileDirty, isSettingsDirty,

        // Tab Navigation
        activeTab, setActiveTab,
        activeSubTab, setActiveSubTab,
        activeAlertsSubTab, setActiveAlertsSubTab,

        // Tab 1: Profile
        profileData, setProfileData, handleProfileSubmit,
        avatarUploading, handleAvatarUpload, handleAvatarRemove,
        confirmingRemove, handleAvatarRemoveConfirmed, handleAvatarRemoveCancel,
        passwordData, setPasswordData, handlePasswordSubmit,
        showPasswordModal, setShowPasswordModal,
        showPIN, setShowPIN,

        // Tab 2: General Settings
        settings, handleSettingInputChange, handleToggleSetting, handleSaveBulkSettings,

        // Tab 3: Products
        categories, showCategoryModal, setShowCategoryModal, selectedCategory, setSelectedCategory, categoryName, setCategoryName,
        categoryVariants, setCategoryVariants, handleCategorySubmit, handleDeleteCategory,
        newOptionValue, setNewOptionValue, handleAddVariantOption, handleUpdateVariantOption, handleDeleteVariantOption, getOptionsForType,

        // Tab 4: Alerts
        alertRules, showRuleModal, setShowRuleModal, ruleForm, setRuleForm,
        handleRuleSubmit, handleToggleRule, handleDeleteRule,

        // Tab 5: Employees
        employees, showEmployeeModal, setShowEmployeeModal, employeeForm, setEmployeeForm,
        selectedEmployee, setSelectedEmployee, handleEmployeeSubmit, handleToggleEmployee, openEditEmployee, openAddEmployee,

        // Tab 6: Checkers
        checkers, showCheckerModal, setShowCheckerModal, checkerForm, setCheckerForm,
        selectedChecker, setSelectedChecker, handleCheckerSubmit, openEditChecker, openAddChecker
    };
}







