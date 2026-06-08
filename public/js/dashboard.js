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

// income/expense chart on dashboard
function initIncomeExpenseChart() {
    const ctx = document.getElementById('income-expense-chart');
    if (!ctx || typeof Chart === 'undefined') return;

    const data = {
        labels: ['This month'],
        datasets: [
            {
                label: 'Income',
                data: [400],
                backgroundColor: 'rgba(150, 94, 94, 0.7)',
                borderRadius: 6,
                barThickness: 18   
            },
            {
                label: '',         
                data: [0],
                backgroundColor: 'transparent',
                barThickness: 8, 
                borderWidth: 0
            },
            {
                label: 'Expenses',
                data: [500],
                backgroundColor: 'rgba(226, 200, 200, 0.9)',
                borderRadius: 6,
                barThickness: 18  
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: { size: 10 }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } },
                categoryPercentage: 0.1
            },
            y: {
                beginAtZero: true,
                max: 1000,      
                ticks: {
                    font: { size: 10 },
                    stepSize: 200
                }
            }
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                window.location.href = '/income-expenses.html';
            }
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data,
        options
    });
}

initIncomeExpenseChart();

// arrow dropdown toggle
function toggleDropdown(header) {
    var dropdown = header.nextElementSibling;

    if (!dropdown) return;

    dropdown.classList.toggle("show");

    // find the arrow icon inside this button
    var arrow = header.querySelector("i");

    if (!arrow) return;

    if (dropdown.classList.contains("show")) {
        arrow.classList.remove("fa-caret-down");
        arrow.classList.add("fa-caret-up");
    } else {
        arrow.classList.add("fa-caret-down");
        arrow.classList.remove("fa-caret-up");
    }
}