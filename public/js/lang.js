let currentLang = localStorage.getItem('lang') || 'en';
let translations = {};

async function loadLanguage(lang) {
    currentLang = lang;
    const response = await fetch(`/lang/${lang}.json`);
    translations = await response.json();
    localStorage.setItem('lang', lang);

    document.documentElement.setAttribute('lang', lang === 'ga' ? 'ga' : 'en');
   
    applyTranslations();

    document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: {
            language: lang,
            translations
        }
    }));

    if (typeof renderMiniCalendar === 'function') {
        renderMiniCalendar();
    }

    if (typeof updateDashboardChartLanguage === 'function') {
        updateDashboardChartLanguage();
    }   
}

function applyTranslations() {
    //regular translations
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

    // HTML content
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');

        if (translations[key]) {
            el.innerHTML = translations[key];
        }
    });

    // Attributes (::before and ::after)
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        const key = el.getAttribute('data-i18n-attr');
        const attributeName = el.getAttribute('data-i18n-attr-name');

        if (translations[key] && attributeName) {
            el.setAttribute(attributeName, translations[key]);
        }
    });
}

// load on page start
loadLanguage(currentLang);

const enBtn = document.getElementById('lang-en');
const gaBtn = document.getElementById('lang-ga');

function setActiveLang(lang) {
    loadLanguage(lang);

    if (enBtn && gaBtn) {
        enBtn.classList.toggle('active', lang === 'en');
        gaBtn.classList.toggle('active', lang === 'ga');
        enBtn.setAttribute('aria-pressed', lang === 'en');
        gaBtn.setAttribute('aria-pressed', lang === 'ga');
    }
}

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

if (typeof renderMiniCalendar === 'function') {
    renderMiniCalendar();
}

if (typeof updateDashboardChartLanguage === 'function') {
    updateDashboardChartLanguage();
}

setActiveLang(currentLang);