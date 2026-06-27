const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/index.html';
}

async function loadUserData() {
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        const user = await response.json();

        const nameEl = document.getElementById('welcome-name');
        if (nameEl && user.fname) {
            nameEl.textContent = user.fname;
        }

    } catch (err) {
        console.error('Failed to load user data:', err);
    }
}
loadUserData();

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

let dashboardChart = null;

//date helper
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getStoredDate(value) {
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;

    return formatLocalDate(parsed);
}

function isCurrentMonth(value) {
    const storedDate = getStoredDate(value);
    if (!storedDate) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    return storedDate.startsWith(`${currentYear}-${currentMonth}`);
}

function createBarDataset(label, data, backgroundColor) {
    return {
        label,
        data,
        backgroundColor,
        borderRadius: 6,
        categoryPercentage: 0.55,
        barPercentage: 0.7,
        maxBarThickness: 38
    };
}

//chart options
function chartOptions(maxValue) {
    const roundedMax = maxValue === 0 ? 100 : Math.ceil(maxValue / 100) * 100;
    const stepSize = Math.max(50, Math.ceil(roundedMax / 5));

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9b6363',
                    font: { family: 'Inter', size: 10 },
                    boxWidth: 12
                }
            },
            tooltip: {
                callbacks: {
                    label: ctx => ` €${parseFloat(ctx.parsed.y).toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#9f998e',
                    font: { size: 10 }
                }
            },
            y: {
                beginAtZero: true,
                max: roundedMax,
                ticks: {
                    color: '#9f998e',
                    font: { size: 10 },
                    stepSize: stepSize,
                    callback: value => `€${value}`
                },
                grid: { color: 'rgba(0,0,0,0.05)' }
            }
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                window.location.href = '/income-expenses.html';
            }
        }
    };
}

//render chart
function renderIncomeExpenseChart(totalIncome, totalExpenses) {
    const canvas = document.getElementById('income-expense-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');

    if (dashboardChart) {
        dashboardChart.destroy();
    }

    const highestValue = Math.max(totalIncome, totalExpenses);

    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['This month'],
            datasets: [
                createBarDataset('Income', [totalIncome], '#7fbc7f'),
                createBarDataset('Expenses', [totalExpenses], '#b88a8a')
            ]
        },
        options: chartOptions(highestValue)
    });
}

//load chart
async function loadIncomeExpenseChart() {
    try {
        const [incomeRes, expenseRes] = await Promise.all([
            fetch('/api/income', {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch('/api/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        let incomeEntries = await incomeRes.json();
        let expenseEntries = await expenseRes.json();

        if (!Array.isArray(incomeEntries)) incomeEntries = [];
        if (!Array.isArray(expenseEntries)) expenseEntries = [];

        const currentMonthIncome = incomeEntries.filter(entry =>
            isCurrentMonth(entry.entry_date || entry.created_at)
        );

        const currentMonthExpenses = expenseEntries.filter(entry =>
            isCurrentMonth(entry.entry_date || entry.created_at)
        );

        const totalIncome = currentMonthIncome.reduce(
            (sum, entry) => sum + parseFloat(entry.amount || 0), 0
        );

        const totalExpenses = currentMonthExpenses.reduce(
            (sum, entry) => sum + parseFloat(entry.amount || 0), 0
        );

        renderIncomeExpenseChart(totalIncome, totalExpenses);
    } catch (err) {
        console.error('Could not load dashboard chart:', err);
    }
}

loadIncomeExpenseChart();


// arrow dropdown toggle
function toggleDropdown(header) {
    var dropdown = header.nextElementSibling;

    if (!dropdown) return;

    dropdown.classList.toggle("show");

    // find the arrow icon inside this button
    var arrow = header.querySelector("i");

    if(arrow){
        if (dropdown.classList.contains("show")) {
            arrow.classList.remove("fa-caret-down");
            arrow.classList.add("fa-caret-up");
    }   else {
            arrow.classList.add("fa-caret-down");
            arrow.classList.remove("fa-caret-up");
        }
    }
    
}

function openSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const header = section.querySelector('.dash-section-header');
    const container = section.querySelector('.dash-section-container');

    if (!header || !container) return;

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (!container.classList.contains('show')) {
        setTimeout(() => {
            toggleDropdown(header);
        }, 500); 
    }
}