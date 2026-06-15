//burger menu
const burgerBtn = document.getElementById('burger-btn');
const mainNav = document.getElementById('main-nav');

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

// LOGOUT FUNCTIONALITY
document.getElementById('logout-btn').addEventListener('click', handleLogout);
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/index.html';
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}
