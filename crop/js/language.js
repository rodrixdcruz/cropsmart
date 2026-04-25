// ============================================================
//  Language System for CropSmart
//  Supports: English, Hindi, Marathi, Tamil
// ============================================================

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('cropsmartLang') || 'en';
        this.translations = this.loadTranslations();
        this.langNames = {
            'en': 'English',
            'hi': 'हिन्दी',
            'mr': 'मराठी',
            'ta': 'தமிழ்'
        };
        this.langFonts = {
            'en': 'Poppins, sans-serif',
            'hi': '"Noto Sans Devanagari", "Poppins", sans-serif',
            'mr': '"Noto Sans Devanagari", "Poppins", sans-serif',
            'ta': '"Noto Sans Tamil", "Poppins", sans-serif'
        };
        this.init();
    }

    loadTranslations() {
        const scriptTag = document.getElementById('language-data');
        if (scriptTag && scriptTag.textContent) {
            try {
                return JSON.parse(scriptTag.textContent);
            } catch (e) {
                console.error('Failed to parse translations:', e);
                return {};
            }
        }
        return {};
    }

    init() {
        this.applyLanguage(this.currentLang);
        this.setupLanguageToggle();
    }

    setupLanguageToggle() {
        const toggle = document.getElementById('languageToggle');
        const menu = document.getElementById('languageMenu');
        const options = document.querySelectorAll('.lang-option');

        if (!toggle || !menu) return;

        // Toggle menu visibility
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', () => {
            menu.classList.add('hidden');
        });

        // Language selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = option.dataset.lang;
                if (lang) {
                    this.switchLanguage(lang);
                    menu.classList.add('hidden');
                }
            });
        });
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        localStorage.setItem('cropsmartLang', lang);
        this.applyLanguage(lang);

        // Update UI
        this.updateToggleButton();
        this.updateActiveOption();
        this.updateSelectOptions();

        // Trigger any language-dependent updates
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    applyLanguage(lang) {
        // Set HTML lang attribute
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Apply font
        document.body.style.fontFamily = this.langFonts[lang] || 'Poppins, sans-serif';

        // Update all i18n elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.dataset.i18n;
            const translation = this.get(key);
            if (translation) {
                // Handle different element types
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Update select options
        this.updateSelectOptions();

        // Update toggle button
        this.updateToggleButton();

        // Update active option
        this.updateActiveOption();
    }

    updateToggleButton() {
        const label = document.getElementById('currentLangLabel');
        if (label) {
            const lang = this.currentLang;
            label.textContent = this.langNames[lang] || lang.toUpperCase();
        }
    }

    updateActiveOption() {
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.dataset.lang === this.currentLang) {
                opt.classList.add('active');
            }
        });
    }

    updateSelectOptions() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                const key = option.dataset.i18n;
                if (key) {
                    const translation = this.get(key);
                    if (translation) {
                        option.textContent = translation;
                    }
                }
            });
        });
    }

    get(key) {
        if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
            return this.translations[this.currentLang][key];
        }
        // Fallback to English
        if (this.translations['en'] && this.translations['en'][key]) {
            return this.translations['en'][key];
        }
        return key;
    }

    translate(key) {
        return this.get(key);
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAllLanguages() {
        return Object.keys(this.langNames);
    }
}

// Initialize language manager when DOM is ready
let languageManager;
document.addEventListener('DOMContentLoaded', () => {
    languageManager = new LanguageManager();
});

// Make it globally accessible
window.LanguageManager = LanguageManager;
window.getLang = () => languageManager ? languageManager.getCurrentLanguage() : 'en';
window.translate = (key) => languageManager ? languageManager.translate(key) : key;