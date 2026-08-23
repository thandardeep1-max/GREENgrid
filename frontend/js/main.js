/**
 * Smart Agriculture Assistant
 * Main JavaScript - Core functionality, navigation, language switching
 */

// ============================================
// Language Management
// ============================================

const LANGUAGE_KEY = 'language';
const LANG_NAMES = { en: 'English', hi: 'हिंदी' };

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || 'en';
let translations = {};

window.currentLanguage = currentLanguage;
document.documentElement.lang = currentLanguage === 'hi' ? 'hi' : 'en';

function getEmbeddedTranslations(lang) {
    return window.I18N && window.I18N[lang] ? window.I18N[lang] : null;
}

// Load translations
async function loadTranslations() {
    try {
        const embeddedTranslations = getEmbeddedTranslations(currentLanguage);
        if (embeddedTranslations) {
            translations = embeddedTranslations;
        } else {
            const response = await fetch(`lang/${currentLanguage}.json`);
            if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
            translations = await response.json();
        }
    } catch (error) {
        translations = getEmbeddedTranslations('en') || {};
        console.log('Using default language (English)');
    }

    applyTranslations();
    updateGreeting();
    updateDate();
}

// Apply translations to all elements with data-lang attribute
function applyTranslations() {
    // Elements whose text content is computed/stored at runtime (storage
    // usage numbers, etc.) must not be overwritten by translations.
    const skipIds = ['storageUsed', 'storageTotal', 'storagePercent'];

    document.querySelectorAll('[data-lang]').forEach(element => {
        if (element.id && skipIds.includes(element.id)) return;
        const key = element.getAttribute('data-lang');
        if (translations[key]) {
            element.textContent = translations[key];
        }
    });

    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (translations[key]) {
            element.setAttribute('placeholder', translations[key]);
        }
    });

    document.querySelectorAll('[data-lang-aria-label]').forEach(element => {
        const key = element.getAttribute('data-lang-aria-label');
        if (translations[key]) {
            element.setAttribute('aria-label', translations[key]);
        }
    });

    // Dispatch language change event for dynamic content re-rendering
    window.dispatchEvent(new CustomEvent('languageChanged'));
}

function syncLanguageUI() {
    document.documentElement.lang = currentLanguage === 'hi' ? 'hi' : 'en';
    window.currentLanguage = currentLanguage;

    const currentLangEl = document.getElementById('currentLang');
    if (currentLangEl) {
        currentLangEl.textContent = LANG_NAMES[currentLanguage] || LANG_NAMES.en;
    }

    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === currentLanguage);
    });

    document.querySelectorAll('.language-card').forEach(card => {
        const isActive = card.dataset.langCode === currentLanguage;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', isActive ? 'true' : 'false');
        const checkIcon = card.querySelector('.language-check');
        if (checkIcon) checkIcon.style.display = isActive ? 'block' : 'none';
    });
}

// Switch language
function switchLanguage(lang) {
    if (!LANG_NAMES[lang]) return;

    currentLanguage = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);
    syncLanguageUI();

    loadTranslations();
}

// ============================================
// Navigation
// ============================================

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }
}

// Language selector toggle
function initLanguageSelector() {
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.getElementById('langDropdown');

    if (langToggle && langDropdown) {
        langToggle.addEventListener('click', () => {
            langDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
                langDropdown.classList.remove('active');
            }
        });

        // Language option click
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', () => {
                switchLanguage(option.dataset.lang);
                langDropdown.classList.remove('active');
            });
        });
    }
}

// ============================================
// Theme Management
// ============================================

const THEME_KEY = 'agrismart-theme';
const THEME_ICONS = {
    light: 'fa-solid fa-sun',
    dark: 'fa-solid fa-moon',
    system: 'fa-solid fa-desktop'
};

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'system';
}

function applyTheme(theme) {
    const root = document.documentElement;
    const selectedTheme = THEME_ICONS[theme] ? theme : 'system';

    if (selectedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', 'system');
        root.classList.toggle('dark', prefersDark);
    } else {
        root.setAttribute('data-theme', selectedTheme);
        root.classList.toggle('dark', selectedTheme === 'dark');
    }

    // Update pill toggle accessibility state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const isDark = selectedTheme === 'dark' || (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
        themeToggle.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    }

    // Update active state in dropdown
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.theme === selectedTheme);
    });

    // Update active state in Settings page cards
    document.querySelectorAll('.theme-card').forEach(card => {
        const isActive = card.dataset.theme === selectedTheme;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
}

function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function initThemeSelector() {
    const themeToggle = document.getElementById('themeToggle');
    const themeDropdown = document.getElementById('themeDropdown');

    if (themeToggle && themeDropdown) {
        // Load stored theme
        applyTheme(getStoredTheme());

        // Pill toggle click - switch between light and dark (not system)
        themeToggle.addEventListener('click', () => {
            toggleLightDarkTheme();
            themeDropdown.classList.remove('active');
        });

        // Keyboard support: Space or Enter toggles theme
        themeToggle.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggleLightDarkTheme();
                themeDropdown.classList.remove('active');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeToggle.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.remove('active');
            }
        });

        // Theme option click (dropdown)
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                setTheme(option.dataset.theme);
                themeDropdown.classList.remove('active');
            });
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (getStoredTheme() === 'system') {
                applyTheme('system');
            }
        });
    }
}

function toggleLightDarkTheme() {
    const currentTheme = getStoredTheme();

    // Toggle between light and dark
    if (currentTheme === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

function cycleTheme() {
    const currentTheme = getStoredTheme();
    let nextTheme;

    switch (currentTheme) {
        case 'light':
            nextTheme = 'dark';
            break;
        case 'dark':
            nextTheme = 'system';
            break;
        case 'system':
        default:
            nextTheme = 'light';
            break;
    }

    setTheme(nextTheme);
}

// ============================================
// Greeting based on time
// ============================================

function updateGreeting() {
    const greetingEl = document.querySelector('.dashboard-greeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let greeting = 'Good Morning';

    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'Good Evening';
    } else if (hour >= 21 || hour < 5) {
        greeting = 'Good Night';
    }

    if (currentLanguage === 'hi' && translations[`greeting_${greeting.toLowerCase().replace(' ', '_')}`]) {
        greeting = translations[`greeting_${greeting.toLowerCase().replace(' ', '_')}`];
    }

    greetingEl.textContent = greeting;
}

// ============================================
// Update date display
// ============================================

function updateDate() {
    const dateEl = document.getElementById('weatherDate');
    if (dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const locale = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        dateEl.textContent = new Date().toLocaleDateString(locale, options);
    }
}

// ============================================
// Spinner Component
// ============================================

function showSpinner(container, size = 'md') {
    container.innerHTML = `<div class="flex justify-center py-xl"><div class="spinner spinner-${size}"></div></div>`;
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fa-solid ${icons[type]}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// Format currency
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ============================================
// Format number
// ============================================

function formatNumber(num) {
    return new Intl.NumberFormat('en-IN').format(num);
}

// ============================================
// Local Storage Helpers
// ============================================

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initLanguageSelector();
    initThemeSelector();
    loadTranslations();
    syncLanguageUI();
});

// ============================================
// Export for other scripts
// ============================================

window.showToast = showToast;
window.showSpinner = showSpinner;
window.formatCurrency = formatCurrency;
window.formatNumber = formatNumber;
window.saveToStorage = saveToStorage;
window.getFromStorage = getFromStorage;
window.currentLanguage = currentLanguage;
window.switchLanguage = switchLanguage;
window.applyTranslations = applyTranslations;
window.setTheme = setTheme;
window.getStoredTheme = getStoredTheme;
