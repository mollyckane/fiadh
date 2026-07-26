let currentLang = localStorage.getItem('lang') || 'en';
let translations = {};

// Set the document language immediately based on saved preference
document.documentElement.setAttribute(
    'lang',
    currentLang === 'ga' ? 'ga' : 'en'
);

// Load a language file and apply all translations
async function loadLanguage(lang) {
    currentLang = lang;
    const response = await fetch(`/lang/${lang}.json`);
    translations = await response.json();
    localStorage.setItem('lang', lang);

    // Update the document language attribute
    document.documentElement.setAttribute('lang', lang === 'ga' ? 'ga' : 'en');

    // Apply translations to all elements with data-i18n attributes
    applyTranslations();

    // Notify pages that the language changed
    document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: {
            language: lang,
            translations
        }
    }));
}

// Apply translations to various attribute types
function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[key]) {
            el.placeholder = translations[key];
        }
    });

    // Inner HTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });

    // Arbitrary attributes (for things like aria-label)
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const key = el.getAttribute('data-i18n-attr');
        const attributeName = el.getAttribute('data-i18n-attr-name');

        if (translations[key] && attributeName) {
            el.setAttribute(attributeName, translations[key]);
        }
    });
}

// Initial language load on page start
loadLanguage(currentLang);

// Language toggle buttons
const enBtn = document.getElementById('lang-en');
const gaBtn = document.getElementById('lang-ga');
const settingsEnBtn = document.getElementById('settings-lang-en');
const settingsGaBtn = document.getElementById('settings-lang-ga');
const selectedLanguageName = document.getElementById('selected-lang-name');
const selectedLanguageStatus = document.getElementById('selected-lang-status');

function setActiveLang(lang) {
    loadLanguage(lang);

    // Sidebar control
    enBtn?.classList.toggle('active', lang === 'en');
    gaBtn?.classList.toggle('active', lang === 'ga');

    enBtn?.setAttribute('aria-pressed', String(lang === 'en'));
    gaBtn?.setAttribute('aria-pressed', String(lang === 'ga'));

    // Settings page control
    settingsEnBtn?.classList.toggle('active', lang === 'en');
    settingsGaBtn?.classList.toggle('active', lang === 'ga');

    settingsEnBtn?.setAttribute('aria-pressed', String(lang === 'en'));
    settingsGaBtn?.setAttribute('aria-pressed', String(lang === 'ga'));

    // Current-language description
    if (selectedLanguageName) {
        selectedLanguageName.textContent = lang === 'ga' ? 'Gaeilge' : 'English';
    }

    if (selectedLanguageStatus) {
        selectedLanguageStatus.textContent =
            lang === 'ga' ? 'Roghnaithe faoi láthair' : 'Currently selected';
    }
}

settingsEnBtn?.addEventListener('click', () => setActiveLang('en'));
settingsGaBtn?.addEventListener('click', () => setActiveLang('ga'));

// Wire button events
if (enBtn) {
    enBtn.addEventListener('click', () => setActiveLang('en'));
    enBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') setActiveLang('en');
    });
}

if (gaBtn) {
    gaBtn.addEventListener('click', () => setActiveLang('ga'));
    gaBtn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') setActiveLang('ga');
    });
}

// Set initial button state without re-loading language again
if (enBtn && gaBtn) {
    enBtn.classList.toggle('active', currentLang === 'en');
    gaBtn.classList.toggle('active', currentLang === 'ga');

    enBtn.setAttribute('aria-pressed', currentLang === 'en');
    gaBtn.setAttribute('aria-pressed', currentLang === 'ga');
}

setActiveLang(currentLang);