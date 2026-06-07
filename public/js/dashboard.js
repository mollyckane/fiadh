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

//show user's name
async function loadUserData() {
    const response = await fetch('/api/auth/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const user = await response.json();
    document.getElementById('welcome-name').textContent = user.fname;
}

loadUserData();