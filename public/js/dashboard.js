const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/index.html';
}

// Load user data for the greeting
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
        const nameEl = document.getElementById('welcome-name');

        if (nameEl && user.fname) {
            nameEl.textContent = user.fname;
        }
    } catch (err) {
        console.error('Failed to load user data:', err);
    }
}

// Simple translation helper for dynamic text
function t(key, fallback = key) {
    return (typeof translations !== 'undefined' && translations && translations[key])
        ? translations[key]
        : fallback;
}

// Mini calendar state
let currentMonthOffset = 0;

// Render the mini calendar
function renderMiniCalendar() {
    const container = document.getElementById('mini-calendar');
    if (!container) return;

    const now = new Date();

    const base = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const locale = document.documentElement.lang === 'ga' ? 'ga-IE' : 'en-IE';

    const monthName = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric'
    }).format(base);

    const weekdayFormatter = new Intl.DateTimeFormat(locale, {
        weekday: 'short'
    });

    const dayNames = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(2023, 0, 1 + index);
        return weekdayFormatter.format(date);
    });

    let html = `
        <div class="calendar-card-header">
            <div class="calendar-title">
                <i class="fa-regular fa-calendar-days" aria-hidden="true"></i>
                <span>${t('dashboard_calendar_heading', 'Calendar')}</span>
            </div>
        </div>

        <div class="cal-month-row">
            <span class="cal-month-label">${monthName}</span>

            <div class="cal-nav-group">
                <button class="cal-nav cal-prev" type="button" aria-label="Previous month">
                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>

                <button class="cal-nav cal-next" type="button" aria-label="Next month">
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </button>
            </div>
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

        <div class="calendar-footer">
            <i class="fa-regular fa-calendar-check" aria-hidden="true"></i>
            <span>0 upcoming</span>
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

// Dashboard chart state
let dashboardChart = null;
let dashboardIncomeTotal = 0;
let dashboardExpenseTotal = 0;

// Date helpers for filtering entries
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

// Chart options
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

// Render chart using your existing translation-based labels
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
            labels: [translations.chart_this_month],
            datasets: [
                createBarDataset(translations.chart_income, [totalIncome], '#7fbc7f'),
                createBarDataset(translations.chart_expenses, [totalExpenses], '#b88a8a')
            ]
        },
        options: chartOptions(highestValue)
    });
}

// Update chart labels when language changes
function updateDashboardChartLanguage() {
    if (!dashboardChart || !translations) {
        return;
    }

    dashboardChart.data.labels = [
        translations.chart_this_month
    ];

    dashboardChart.data.datasets[0].label = translations.chart_income;
    dashboardChart.data.datasets[1].label = translations.chart_expenses;

    dashboardChart.update();
}

// Load chart data and render chart
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

        dashboardIncomeTotal = totalIncome;
        dashboardExpenseTotal = totalExpenses;

        renderIncomeExpenseChart(dashboardIncomeTotal, dashboardExpenseTotal);
    } catch (err) {
        console.error('Could not load dashboard chart:', err);
    }
}

// React to language changes in one place
document.addEventListener('languageChanged', () => {
    renderMiniCalendar();
    updateDashboardChartLanguage();
});

// Dropdown toggle logic
function toggleDropdown(header) {
    const dropdown = header.nextElementSibling;
    if (!dropdown) return;

    const isOpen = dropdown.classList.toggle('show');
    const icon = header.querySelector('i');

    header.setAttribute('aria-expanded', String(isOpen));

    if (icon) {
        icon.classList.remove(
            'fa-plus',
            'fa-minus',
            'fa-caret-up',
            'fa-caret-down'
        );

        icon.classList.add(isOpen ? 'fa-minus' : 'fa-plus');
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

// Startup calls
loadUserData();
renderMiniCalendar();
loadIncomeExpenseChart();