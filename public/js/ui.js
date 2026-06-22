//burger menu - only run if elements exist on this page
const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');

if(burgerBtn && mainNav){
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('open');
        mainNav.classList.toggle('open');
    });
    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('open');
            mainNav.classList.remove('open');
        });
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

//live date 
function updateDateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('en-IE', { weekday: 'long' });
    const date = now.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false });

    document.getElementById('live-datetime').textContent = `${day}, ${date}, ${time}`;
}
if (document.getElementById('live-datetime')) {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

