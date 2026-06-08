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

//live date 
function updateDateTime() {
    const now = new Date();

    const day = now.toLocaleDateString('en-IE', { weekday: 'long' });
    const date = now.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', hour12: false });

    document.getElementById('live-datetime').textContent = `${day}, ${date}, ${time}`;
}

// run then update every second
updateDateTime();
setInterval(updateDateTime, 1000);

//custom mini calendar
let currentMonthOffset=0;

function renderMiniCalendar() {
    const container = document.getElementById('mini-calendar');
    const now = new Date();

    const base = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let html = `
    <div class="cal-header">
    <button class="cal-nav cal-prev" type="button" aria-label="Previous month">&lt;</button>
    <span class="cal-month-label">${monthNames[month]} ${year}</span>
    <button class="cal-nav cal-next" type="button" aria-label="Next month">&gt;</button>
</div>
<div class="cal-grid">
    ${dayNames.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
    ${Array(firstDay).fill('<div class="cal-day empty"></div>').join('')}
    ${Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const isToday = isCurrentMonth && day === today.getDate();
        return `<div class="cal-day${isToday ? ' today' : ''}">${day}</div>`;
    }).join('')}
</div>
    `;

    container.innerHTML = html;

    container.querySelector('.cal-prev').addEventListener('click', () => {
        currentMonthOffset -= 1;
        renderMiniCalendar();
    });

    container.querySelector('.cal-next').addEventListener('click', () => {
        currentMonthOffset += 1;
        renderMiniCalendar();
    });
}

renderMiniCalendar();