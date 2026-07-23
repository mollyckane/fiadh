// mobile burger menu - only run if elements exist on this page
const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');
const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('open');
        mainNav.classList.toggle('open');
    });

    // close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('open');
            mainNav.classList.remove('open');
        });
    });
}

// desktop sidebar collapse - only run if toggle exists on this page
const desktopToggle = document.getElementById('desktop-sidebar-toggle');

if(desktopToggle){
    // apply saved preference on page load
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (sidebarCollapsed && window.innerWidth > 900){
        document.body.classList.add('sidebar-collapsed');
        desktopToggle.setAttribute('aria-expanded', 'false');
        desktopToggle.setAttribute('aria-label', 'Expand sidebar');
    }

        desktopToggle.addEventListener('click', () => {
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');

        desktopToggle.setAttribute('aria-expanded', String(!isCollapsed));
        desktopToggle.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');

        //save preference
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));

        // give the CSS transition time to finish before resizing the chart
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 360);
    });
}

// generators submenu
const generatorsToggle = document.getElementById('generatorsToggle');
const generatorsMenu = document.getElementById('generatorsMenu');

if (generatorsToggle && generatorsMenu) {
    generatorsToggle.addEventListener('click', () => {
        const isOpen =
            generatorsToggle.getAttribute('aria-expanded') === 'true';

        generatorsToggle.setAttribute('aria-expanded', String(!isOpen));
        generatorsMenu.hidden = isOpen;
    });
}

// logout functionality
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}

//fade elements
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pageLoadElement = document.querySelector('.page-load');

    if (!pageLoadElement) return;

    if (prefersReducedMotion) {
        pageLoadElement.classList.add('is-visible');
        return;
    }

    requestAnimationFrame(() => {
        pageLoadElement.classList.add('is-visible');
    });
});

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// live date
function updateDateTime() {
    const now = new Date();

    // Use the current document language for all pages
    const locale = document.documentElement.lang === 'ga' ? 'ga-IE' : 'en-IE';

    const day = now.toLocaleDateString(locale, { weekday: 'long' });
    const date = now.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const time = now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const el = document.getElementById('live-datetime');
    if (el) {
        el.textContent = `${day}, ${date}, ${time}`;
    }
}

if (document.getElementById('live-datetime')) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

//texture ready
const sidebarTexture = new Image();
sidebarTexture.src = "images/texture.webp";

sidebarTexture.addEventListener("load", () => {
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        navbar.classList.add("texture-ready");
    }
});
