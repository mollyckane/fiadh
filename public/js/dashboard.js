// LOGOUT FUNCTIONALITY
document.getElementById('logout-btn').addEventListener('click', handleLogout);
const token = localStorage.getItem('token');

// if (!token) {
//     window.location.href = '/index.html';
// }

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
}