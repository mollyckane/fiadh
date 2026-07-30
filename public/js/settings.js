/*
This file handles the functionality of the settings page, including loading user data and handling logout.
*/

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/index.html';
}

// Load user first name & last name
async function loadUserData() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        const user = await response.json();
        const nameEl = document.getElementById('settings-name');
        const emailEl = document.getElementById('settings-email');

        if (nameEl && user.fname && user.lname) {
            nameEl.textContent = `${user.fname} ${user.lname}`;
        }

        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }
    } catch (err) {
        console.error('Failed to load user data:', err);
    }
}

loadUserData();