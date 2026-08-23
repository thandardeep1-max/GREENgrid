/**
 * Smart Agriculture Assistant
 * Settings JavaScript - Settings page functionality
 */

// ============================================
// Settings State
// ============================================

const SETTINGS_KEYS = {
    farmProfile: 'agrismart-farm-profile',
    weatherAlerts: 'agrismart-weather-alerts',
    appData: 'agrismart-app-data',
    farmerDetails: 'agrismart-farmer-details',
    currentCrops: 'agrismart-current-crops'
};

let currentTab = 'theme-language';
let currentCrops = [];

// ============================================
// Initialize Settings Page
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initSettingsTabs();
    initThemeLanguagePanel();
    initFarmProfilePanel();
    initWeatherAlertsPanel();
    initAppDataPanel();
    initFarmerDetailsPanel();
    loadAllSettings();
});

// ============================================
// Tab Navigation
// ============================================

function initSettingsTabs() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active panel
            panels.forEach(panel => panel.classList.remove('active'));
            document.getElementById(`${tabName}-panel`).classList.add('active');

            currentTab = tabName;
        });
    });
}

// ============================================
// Theme & Language Panel
// ============================================

function initThemeLanguagePanel() {
    // Theme cards
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            setTheme(card.dataset.theme);
        });
    });

    // Language cards
    document.querySelectorAll('.language-card').forEach(card => {
        card.addEventListener('click', () => {
            switchLanguage(card.dataset.langCode);
        });
    });

    // Set initial active states based on current settings
    updateThemeLanguageUI();
}

function updateThemeLanguageUI() {
    const theme = getStoredTheme();
    const lang = window.currentLanguage || localStorage.getItem('language') || 'en';

    // Theme
    document.querySelectorAll('.theme-card').forEach(card => {
        const isActive = card.dataset.theme === theme;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', isActive);
    });

    // Language
    document.querySelectorAll('.language-card').forEach(card => {
        const isActive = card.dataset.langCode === lang;
        card.classList.toggle('active', isActive);
        const checkIcon = card.querySelector('.language-check');
        if (checkIcon) checkIcon.style.display = isActive ? 'block' : 'none';
    });
}

// ============================================
// Farm Profile Panel
// ============================================

function initFarmProfilePanel() {
    const form = document.getElementById('farmProfileForm');
    const addCropBtn = document.getElementById('addCropBtn');
    const resetBtn = document.getElementById('resetFarmBtn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveFarmProfile();
        });
    }

    if (addCropBtn) {
        addCropBtn.addEventListener('click', () => addCropInput());
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => resetFarmProfile());
    }
}

function loadFarmProfile() {
    const data = getFromStorage(SETTINGS_KEYS.farmProfile);
    if (!data) return;

    // Fill form fields
    const fields = [
        'farmName', 'farmSize', 'farmState', 'farmDistrict', 'farmAddress',
        'soilType', 'soilPh', 'waterSource', 'waterAvailability', 'irrigationType'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && data[field] !== undefined) {
            el.value = data[field];
        }
    });

    // Load crops
    currentCrops = getFromStorage(SETTINGS_KEYS.currentCrops) || [];
    renderCropList();
}

function saveFarmProfile() {
    const fields = [
        'farmName', 'farmSize', 'farmState', 'farmDistrict', 'farmAddress',
        'soilType', 'soilPh', 'waterSource', 'waterAvailability', 'irrigationType'
    ];

    const data = {};
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) data[field] = el.value;
    });

    data.currentCrops = currentCrops;
    data.updatedAt = new Date().toISOString();

    saveToStorage(SETTINGS_KEYS.farmProfile, data);
    saveToStorage(SETTINGS_KEYS.currentCrops, currentCrops);

    window.showToast('Farm profile saved successfully!', 'success');
}

function resetFarmProfile() {
    if (confirm('Are you sure you want to reset the farm profile? This cannot be undone.')) {
        localStorage.removeItem(SETTINGS_KEYS.farmProfile);
        localStorage.removeItem(SETTINGS_KEYS.currentCrops);
        currentCrops = [];

        const form = document.getElementById('farmProfileForm');
        if (form) form.reset();

        renderCropList();
        window.showToast('Farm profile reset', 'info');
    }
}

function addCropInput(cropData = null) {
    const container = document.getElementById('currentCropsList');
    const index = currentCrops.length;

    const crop = cropData || {
        name: '',
        variety: '',
        area: '',
        sowingDate: '',
        stage: 'sowing'
    };

    currentCrops.push(crop);
    renderCropList();
}

function renderCropList() {
    const container = document.getElementById('currentCropsList');
    if (!container) return;

    if (currentCrops.length === 0) {
        container.innerHTML = `
            <p class="empty-state-text" data-lang="no_crops_added">No crops added yet. Click "Add Crop" to start.</p>
        `;
        if (window.applyTranslations) window.applyTranslations();
        return;
    }

    container.innerHTML = currentCrops.map((crop, index) => `
        <div class="crop-item" data-index="${index}">
            <div class="crop-item-header">
                <h4 data-lang="crop_entry">${index + 1}. Crop Entry</h4>
                <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="removeCrop(${index})" aria-label="Remove crop">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="form-row">
                <div class="field">
                    <label class="label" data-lang="crop_name">Crop Name</label>
                    <input type="text" class="input" value="${crop.name || ''}" placeholder="e.g., Groundnut" onchange="updateCrop(${index}, 'name', this.value)">
                </div>
                <div class="field">
                    <label class="label" data-lang="crop_variety">Variety</label>
                    <input type="text" class="input" value="${crop.variety || ''}" placeholder="e.g., GG-20" onchange="updateCrop(${index}, 'variety', this.value)">
                </div>
            </div>
            <div class="form-row">
                <div class="field">
                    <label class="label" data-lang="crop_area">Area (Acres)</label>
                    <input type="number" class="input" value="${crop.area || ''}" step="0.5" min="0" placeholder="e.g., 5" onchange="updateCrop(${index}, 'area', this.value)">
                </div>
                <div class="field">
                    <label class="label" data-lang="sowing_date">Sowing Date</label>
                    <input type="date" class="input" value="${crop.sowingDate || ''}" onchange="updateCrop(${index}, 'sowingDate', this.value)">
                </div>
            </div>
            <div class="field">
                <label class="label" data-lang="growth_stage">Current Growth Stage</label>
                <select class="select" onchange="updateCrop(${index}, 'stage', this.value)">
                    <option value="sowing" ${crop.stage === 'sowing' ? 'selected' : ''} data-lang="stage_sowing">Sowing</option>
                    <option value="germination" ${crop.stage === 'germination' ? 'selected' : ''} data-lang="stage_germination">Germination</option>
                    <option value="vegetative" ${crop.stage === 'vegetative' ? 'selected' : ''} data-lang="stage_vegetative">Vegetative</option>
                    <option value="flowering" ${crop.stage === 'flowering' ? 'selected' : ''} data-lang="stage_flowering">Flowering</option>
                    <option value="fruiting" ${crop.stage === 'fruiting' ? 'selected' : ''} data-lang="stage_fruiting">Fruiting/Pod Formation</option>
                    <option value="harvest" ${crop.stage === 'harvest' ? 'selected' : ''} data-lang="stage_harvest">Harvest</option>
                </select>
            </div>
        </div>
    `).join('');

    if (window.applyTranslations) window.applyTranslations();
}

function updateCrop(index, field, value) {
    if (currentCrops[index]) {
        currentCrops[index][field] = value;
    }
}

function removeCrop(index) {
    currentCrops.splice(index, 1);
    renderCropList();
}

// Make functions globally accessible
window.removeCrop = removeCrop;
window.updateCrop = updateCrop;

// ============================================
// Weather Alerts Panel
// ============================================

function initWeatherAlertsPanel() {
    const saveBtn = document.getElementById('saveWeatherAlertsBtn');

    // Load saved settings
    loadWeatherAlerts();

    if (saveBtn) {
        saveBtn.addEventListener('click', saveWeatherAlerts);
    }
}

function loadWeatherAlerts() {
    const data = getFromStorage(SETTINGS_KEYS.weatherAlerts) || getDefaultWeatherAlerts();

    // Toggle inputs
    const toggles = [
        'alertHeavyRain', 'alertHighTemp', 'alertHighWind',
        'alertHighHumidity', 'alertHighUV', 'alertStorm',
        'alertCropSpecific'
    ];

    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (el && data[id] !== undefined) {
            el.checked = data[id];
        }
    });

    // Select inputs
    const selects = ['alertLeadTime', 'quietHoursStart', 'quietHoursEnd'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el && data[id] !== undefined) {
            el.value = data[id];
        }
    });
}

function getDefaultWeatherAlerts() {
    return {
        alertHeavyRain: true,
        alertHighTemp: true,
        alertHighWind: true,
        alertHighHumidity: false,
        alertHighUV: false,
        alertStorm: true,
        alertCropSpecific: true,
        alertLeadTime: '12',
        quietHoursStart: '22:00',
        quietHoursEnd: '06:00'
    };
}

function saveWeatherAlerts() {
    const data = getDefaultWeatherAlerts();

    // Toggle inputs
    const toggles = [
        'alertHeavyRain', 'alertHighTemp', 'alertHighWind',
        'alertHighHumidity', 'alertHighUV', 'alertStorm',
        'alertCropSpecific'
    ];

    toggles.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.checked;
    });

    // Select inputs
    const selects = ['alertLeadTime', 'quietHoursStart', 'quietHoursEnd'];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) data[id] = el.value;
    });

    data.updatedAt = new Date().toISOString();

    saveToStorage(SETTINGS_KEYS.weatherAlerts, data);
    window.showToast('Weather alert preferences saved!', 'success');
}

// ============================================
// App Data Panel
// ============================================

function initAppDataPanel() {
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const clearOfflineBtn = document.getElementById('clearOfflineBtn');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    const autoSync = document.getElementById('autoSync');
    const dailyBackup = document.getElementById('dailyBackup');
    const usageAnalytics = document.getElementById('usageAnalytics');

    // Load saved settings
    loadAppDataSettings();

    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }

    if (clearOfflineBtn) {
        clearOfflineBtn.addEventListener('click', clearOfflineData);
    }

    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportUserData);
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', confirmDeleteAccount);
    }

    // Sync toggles
    [autoSync, dailyBackup, usageAnalytics].forEach(toggle => {
        if (toggle) {
            toggle.addEventListener('change', saveAppDataSettings);
        }
    });

    // Calculate and display storage usage
    updateStorageDisplay();
}

function loadAppDataSettings() {
    const data = getFromStorage(SETTINGS_KEYS.appData) || {
        autoSync: true,
        dailyBackup: true,
        usageAnalytics: false
    };

    const autoSync = document.getElementById('autoSync');
    const dailyBackup = document.getElementById('dailyBackup');
    const usageAnalytics = document.getElementById('usageAnalytics');

    if (autoSync) autoSync.checked = data.autoSync !== false;
    if (dailyBackup) dailyBackup.checked = data.dailyBackup !== false;
    if (usageAnalytics) usageAnalytics.checked = data.usageAnalytics === true;
}

function saveAppDataSettings() {
    const data = {
        autoSync: document.getElementById('autoSync')?.checked ?? true,
        dailyBackup: document.getElementById('dailyBackup')?.checked ?? true,
        usageAnalytics: document.getElementById('usageAnalytics')?.checked ?? false,
        updatedAt: new Date().toISOString()
    };

    saveToStorage(SETTINGS_KEYS.appData, data);
}

function updateStorageDisplay() {
    // Calculate approximate localStorage usage
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length + key.length;
        }
    }

    const usedMB = (totalSize / (1024 * 1024)).toFixed(1);
    const totalMB = 15; // Typical localStorage limit ~5-10MB, showing 15MB for UI
    const percent = Math.min(Math.round((totalSize / (totalMB * 1024 * 1024)) * 100), 100);

    const storageBar = document.getElementById('storageBar');
    const storageUsed = document.getElementById('storageUsed');
    const storageTotal = document.getElementById('storageTotal');
    const storagePercent = document.getElementById('storagePercent');

    if (storageBar) storageBar.style.width = `${percent}%`;
    if (storageUsed) storageUsed.textContent = `${usedMB} MB`;
    if (storageTotal) storageTotal.textContent = `${totalMB} MB`;
    if (storagePercent) storagePercent.textContent = `(${percent}% used)`;
}

function clearCache() {
    // Clear temporary cache items (keys starting with 'cache_' or 'temp_')
    const keysToRemove = [];
    for (let key in localStorage) {
        if (key.startsWith('cache_') || key.startsWith('temp_') || key.startsWith('agrismart-cache')) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    updateStorageDisplay();
    window.showToast('Cache cleared successfully', 'success');
}

function clearOfflineData() {
    if (confirm('This will remove all offline data. You may need to re-download content when offline. Continue?')) {
        const keysToRemove = [];
        for (let key in localStorage) {
            if (key.startsWith('agrismart-offline') || key.startsWith('offline_')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
        updateStorageDisplay();
        window.showToast('Offline data cleared', 'success');
    }
}

function exportUserData() {
    const exportData = {};

    // Collect all agrismart keys
    for (let key in localStorage) {
        if (key.startsWith('agrismart-') || key === 'language') {
            try {
                exportData[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                exportData[key] = localStorage.getItem(key);
            }
        }
    }

    exportData.exportedAt = new Date().toISOString();
    exportData.version = '1.0';

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agrismart-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    window.showToast('Data exported successfully', 'success');
}

function confirmDeleteAccount() {
    if (confirm('WARNING: This will permanently delete ALL your data including farm profile, settings, crops, and farmer details. This cannot be undone. Are you absolutely sure?')) {
        if (confirm('Final confirmation: Delete everything?')) {
            // Clear all agrismart data
            const keysToRemove = [];
            for (let key in localStorage) {
                if (key.startsWith('agrismart-') || key === 'language') {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));

            window.showToast('All data deleted. Reloading...', 'info');
            setTimeout(() => location.reload(), 1500);
        }
    }
}

// ============================================
// Farmer Details Panel
// ============================================

function initFarmerDetailsPanel() {
    const form = document.getElementById('farmerDetailsForm');
    const resetBtn = document.getElementById('resetFarmerBtn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveFarmerDetails();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => resetFarmerDetails());
    }

    loadFarmerDetails();
}

function loadFarmerDetails() {
    const data = getFromStorage(SETTINGS_KEYS.farmerDetails);
    if (!data) return;

    const fields = [
        'farmerFirstName', 'farmerLastName', 'farmerPhone', 'farmerEmail', 'farmerAadhar',
        'farmingYears', 'farmingType', 'primaryCrops',
        'bankName', 'accountNumber', 'ifscCode', 'kisanCreditCard',
        'pmKisanId', 'landRecord',
        'emergencyName', 'emergencyPhone', 'emergencyRelation'
    ];

    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el && data[field] !== undefined) {
            el.value = data[field];
        }
    });
}

function saveFarmerDetails() {
    const fields = [
        'farmerFirstName', 'farmerLastName', 'farmerPhone', 'farmerEmail', 'farmerAadhar',
        'farmingYears', 'farmingType', 'primaryCrops',
        'bankName', 'accountNumber', 'ifscCode', 'kisanCreditCard',
        'pmKisanId', 'landRecord',
        'emergencyName', 'emergencyPhone', 'emergencyRelation'
    ];

    const data = {};
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) data[field] = el.value;
    });

    data.updatedAt = new Date().toISOString();

    saveToStorage(SETTINGS_KEYS.farmerDetails, data);
    window.showToast('Farmer details saved successfully!', 'success');
}

function resetFarmerDetails() {
    if (confirm('Are you sure you want to reset all farmer details? This cannot be undone.')) {
        localStorage.removeItem(SETTINGS_KEYS.farmerDetails);

        const form = document.getElementById('farmerDetailsForm');
        if (form) form.reset();

        window.showToast('Farmer details reset', 'info');
    }
}

// ============================================
// Load All Settings
// ============================================

function loadAllSettings() {
    loadFarmProfile();
    loadWeatherAlerts();
    loadAppDataSettings();
    loadFarmerDetails();
    updateThemeLanguageUI();
    updateStorageDisplay();
}

// ============================================
// Export for other scripts
// ============================================

window.loadAllSettings = loadAllSettings;
window.saveFarmProfile = saveFarmProfile;
window.saveWeatherAlerts = saveWeatherAlerts;
window.saveFarmerDetails = saveFarmerDetails;
window.exportUserData = exportUserData;