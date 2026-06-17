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


