//income-expenses.js
document.addEventListener('DOMContentLoaded', async () => {
    // token authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }

    function t(key, fallback = key) {
        return translations?.[key] ?? fallback;
    }

    function interpolate(text, values) {
        return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
    }

    function getCategoryLabel(category) {
        const categoryKeys = {
            'Commissions': 'category_income_commissions',
            'Grants': 'category_income_grants',
            'Licensing': 'category_income_licensing',
            'Event / Performance': 'category_income_event_performance',
            'Teaching / Workshops': 'category_income_teaching_workshops',
            'Print Sales': 'category_income_print_sales',

            'Art Materials': 'category_expense_art_materials',
            'Equipment': 'category_expense_equipment',
            'Software / Subscriptions': 'category_expense_software_subscriptions',
            'Travel': 'category_expense_travel',
            'Marketing': 'category_expense_marketing',
            'Studio Rent': 'category_expense_studio_rent',
            'Professional Services': 'category_expense_professional_services'
        };

        const translationKey = categoryKeys[category];

        return translationKey
            ? t(translationKey, category)
            : category;
    }

    //default date to today
    function formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const today = formatLocalDate(new Date());

    document.getElementById('expDate').value = today;
    document.getElementById('incDate').value = today;

    // quick add expandable bars
    const openIncomeBarBtn = document.getElementById('openIncomeBarBtn');
    const openExpenseBarBtn = document.getElementById('openExpenseBarBtn');
    const closeIncomeBarBtn = document.getElementById('closeIncomeBarBtn');
    const closeExpenseBarBtn = document.getElementById('closeExpenseBarBtn');
    const incomeQuickBar = document.getElementById('incomeQuickBar');
    const expenseQuickBar = document.getElementById('expenseQuickBar');

    function incomeFormHasValues() {
        return (
            document.getElementById('incAmount').value.trim() !== '' ||
            document.getElementById('incDate').value !== today ||
            document.getElementById('incSource').value.trim() !== '' ||
            document.getElementById('incCategory').value !== '' ||
            document.getElementById('incCategoryCustom').value.trim() !== '' ||
            document.getElementById('incNotes').value.trim() !== ''
        );
    }

    function expenseFormHasValues() {
        return (
            document.getElementById('expAmount').value.trim() !== '' ||
            document.getElementById('expDate').value !== today ||
            document.getElementById('expCategory').value !== '' ||
            document.getElementById('expCategoryCustom').value.trim() !== '' ||
            document.getElementById('expNotes').value.trim() !== ''
        );
    }

    function confirmDiscardIfNeeded(typeToOpen = null) {
        const incomeOpen = incomeQuickBar.classList.contains('show');
        const expenseOpen = expenseQuickBar.classList.contains('show');

        if (incomeOpen && typeToOpen !== 'income' && incomeFormHasValues()) {
            return confirm('Discard your unsaved income entry?');
        }

        if (expenseOpen && typeToOpen !== 'expense' && expenseFormHasValues()) {
            return confirm('Discard your unsaved expense entry?');
        }

        return true;
    }

    function closeIncomeBar(reset = false) {
        incomeQuickBar.classList.remove('show');
        openIncomeBarBtn.classList.remove('active');
        openIncomeBarBtn.setAttribute('aria-expanded', 'false');

        incomeQuickBar.addEventListener('transitionend', () => {
            if (reset) resetIncomeForm();
        }, { once: true });
    }

    function closeExpenseBar(reset = false) {
        expenseQuickBar.classList.remove('show');
        openExpenseBarBtn.classList.remove('active');
        openExpenseBarBtn.setAttribute('aria-expanded', 'false');

        expenseQuickBar.addEventListener('transitionend', () => {
            if (reset) resetExpenseForm();
        }, { once: true });
    }

    function openIncomeBar() {
        if (!confirmDiscardIfNeeded('income')) return;

        closeExpenseBar(true);
        incomeQuickBar.classList.add('show');
        openIncomeBarBtn.classList.add('active');
        openIncomeBarBtn.setAttribute('aria-expanded', 'true');
        openExpenseBarBtn.setAttribute('aria-expanded', 'false');
        document.getElementById('incAmount').focus();
    }

    function openExpenseBar() {
        if (!confirmDiscardIfNeeded('expense')) return;

        closeIncomeBar(true);
        expenseQuickBar.classList.add('show');
        openExpenseBarBtn.classList.add('active');
        openExpenseBarBtn.setAttribute('aria-expanded', 'true');
        openIncomeBarBtn.setAttribute('aria-expanded', 'false');
        document.getElementById('expAmount').focus();
    }

    openIncomeBarBtn.addEventListener('click', () => {
        const isOpen = incomeQuickBar.classList.contains('show');

        if (isOpen) {
            if (!confirmDiscardIfNeeded()) return;
            closeIncomeBar(true);
            return;
        }

        openIncomeBar();
    });

    openExpenseBarBtn.addEventListener('click', () => {
        const isOpen = expenseQuickBar.classList.contains('show');

        if (isOpen) {
            if (!confirmDiscardIfNeeded()) return;
            closeExpenseBar(true);
            return;
        }

        openExpenseBar();
    });

    closeIncomeBarBtn.addEventListener('click', () => {
        if (!confirmDiscardIfNeeded()) return;
        closeIncomeBar(true);
    });

    closeExpenseBarBtn.addEventListener('click', () => {
        if (!confirmDiscardIfNeeded()) return;
        closeExpenseBar(true);
    });

    //custom category toggle
    function wireCustomCategory(selectId, customInputId, backButtonId) {
        const select = document.getElementById(selectId);
        const custom = document.getElementById(customInputId);
        const backButton = document.getElementById(backButtonId);

        function showCustomInput() {
            select.hidden = true;
            custom.hidden = false;
            backButton.hidden = false;
            custom.required = true;
            custom.focus();
        }

        function showSelect() {
            select.hidden = false;
            custom.hidden = true;
            backButton.hidden = true;
            custom.required = false;
            custom.value = '';
            select.value = '';
            select.focus();
        }
        select.addEventListener('change', () => {
            if (select.value === 'Other') {
                showCustomInput();
            }
        });
        backButton.addEventListener('click', showSelect);
    }
    wireCustomCategory('expCategory', 'expCategoryCustom', 'expCategoryBackBtn');
    wireCustomCategory('incCategory', 'incCategoryCustom', 'incCategoryBackBtn');

    function resolveCategory(selectId, customId) {
        const select = document.getElementById(selectId);
        const custom = document.getElementById(customId);
        return select.value === 'Other' ? custom.value.trim() : select.value;
    }

    //default states of input/selections/options
    let allIncome = [];
    let allExpenses = [];
    let historyFilter = 'all';
    let chartView = 'income';
    let chartMode = 'breakdown';
    let timeRange = 'month';
    let customFrom = null;
    let customTo = null;
    let trackerChart = null;

    //fetch data
    async function loadAll() {
        try {
            const [incRes, expRes] = await Promise.all([
                fetch('/api/income', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/expenses', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            allIncome = await incRes.json();
            allExpenses = await expRes.json();
            if (!Array.isArray(allIncome)) allIncome = [];
            if (!Array.isArray(allExpenses)) allExpenses = [];
            renderHistory();
            renderChart();
        }
        catch (err) {
            console.error('Could not load data: ', err);
        }
    }

    //save an expense
    document.getElementById('saveExpenseBtn').addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('expAmount').value);
        const date = document.getElementById('expDate').value;
        const category = resolveCategory('expCategory', 'expCategoryCustom');
        const notes = document.getElementById('expNotes').value.trim();

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, category, entry_date: date || today, notes })
            });
            const result = await res.json();
            if (res.ok) {
                resetExpenseForm();
                closeExpenseBar();
                loadAll();
            }
            else {
                alert(result.error || 'Failed to save expense.');
            }
        }
        catch (err) {
            console.error(err);
            alert('An error has occurred. Please try again.');
        }
    });

    //save income
    document.getElementById('saveIncomeBtn').addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('incAmount').value);
        const date = document.getElementById('incDate').value;
        const source = document.getElementById('incSource').value.trim();
        const category = resolveCategory('incCategory', 'incCategoryCustom');
        const notes = document.getElementById('incNotes').value.trim();

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        try {
            const res = await fetch('/api/income', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, source, category, entry_date: date || today, notes })
            });
            const result = await res.json();
            if (res.ok) {
                resetIncomeForm();
                closeIncomeBar();
                loadAll();
            }
            else {
                alert(result.error || 'Failed to save income.');
            }
        }
        catch (err) {
            console.error(err);
            alert('An error has occurred. Please try again.');
        }
    });

    //form resets
    function resetExpenseForm() {
        document.getElementById('expAmount').value = '';
        document.getElementById('expDate').value = today;
        document.getElementById('expCategory').value = '';
        document.getElementById('expCategory').hidden = false;
        document.getElementById('expCategoryCustom').value = '';
        document.getElementById('expCategoryCustom').hidden = true;
        document.getElementById('expCategoryCustom').required = false;
        document.getElementById('expCategoryBackBtn').hidden = true;
        document.getElementById('expNotes').value = '';
    }

    function resetIncomeForm() {
        document.getElementById('incAmount').value = '';
        document.getElementById('incDate').value = today;
        document.getElementById('incSource').value = '';
        document.getElementById('incCategory').value = '';
        document.getElementById('incCategory').hidden = false;
        document.getElementById('incCategoryCustom').value = '';
        document.getElementById('incCategoryCustom').hidden = true;
        document.getElementById('incCategoryCustom').required = false;
        document.getElementById('incCategoryBackBtn').hidden = true;
        document.getElementById('incNotes').value = '';
    }

    //history filter buttons
    document.querySelectorAll('.history-filter button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.history-filter button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            historyFilter = btn.dataset.filter;
            renderHistory();
        });
    });

    //render history
    function renderHistory() {
        const list = document.getElementById('historyList');

        let entries = [];
        if (historyFilter === 'all' || historyFilter === 'income') {
            allIncome.forEach(item => entries.push({ ...item, _type: 'income' }));
        }
        if (historyFilter === 'all' || historyFilter === 'expense') {
            allExpenses.forEach(item => entries.push({ ...item, _type: 'expense' }));
        }

        //sort by entry_date desceding, fall back to create_at
        entries.sort((a, b) => {
            const da = getStoredDate(a.entry_date || a.created_at);
            const db = getStoredDate(b.entry_date || b.created_at);
            return db.localeCompare(da);
        });

        if (entries.length === 0) {
            list.innerHTML = `
                <p class="history-empty">
                    ${t('history_no_entries', 'No entries yet.')}
                </p>
            `;
            return;
        }

        let lastMonthKey = '';

        list.innerHTML = entries.map(entry => {
            const rawDate = entry.entry_date || entry.created_at;
            const entryDate = rawDate ? new Date(rawDate) : new Date();

            const monthKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}`;

            const monthLabel = entryDate.toLocaleDateString(
                document.documentElement.lang === 'ga' ? 'ga-IE' : 'en-IE',
                {
                month: 'long',
                year: 'numeric'
            });

            const separatorHtml = monthKey !== lastMonthKey
                ? `<p class="invoice-history-separator">${monthLabel}</p>`
                : '';

            lastMonthKey = monthKey;

            const isIncome = entry._type === 'income';

            const title = isIncome
                ? (entry.source || t('history_untitled_income', 'Untitled income'))
                : (entry.category
                    ? getCategoryLabel(entry.category)
                    : t('history_untitled_expense', 'Untitled expense'));

            const reference = isIncome
                ? (entry.category
                    ? getCategoryLabel(entry.category)
                    : t('history_no_category', 'No category'))
                : (entry.notes || t('history_no_notes', 'No notes'));

            const locale = document.documentElement.lang === 'ga' ? 'ga-IE' : 'en-IE';
            const displayDate = entryDate.toLocaleDateString(locale);

            return `
    ${separatorHtml}

    <article class="history-item invoice-history-item">
        <div class="invoice-history-main">
            <div class="invoice-history-client">
                <span class="invoice-history-invoice-number">
                    ${reference}
                </span>

                <span class="history-item-label">
                    ${title}
                </span>
            </div>

            <div class="invoice-history-meta">
                <span class="invoice-history-due">
                    ${displayDate}
                </span>

                <span class="status-pill ${isIncome ? 'paid' : 'overdue'}">
                ${isIncome
                    ? t('history_entry_income', 'Income')
                    : t('history_entry_expense', 'Expense')}
                </span>
            </div>
        </div>

        <div class="invoice-history-side">
            <strong class="invoice-history-total ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : '-'}€${parseFloat(entry.amount || 0).toFixed(2)}
            </strong>

            <div class="history-item-right invoice-history-actions">
                <button
                    type="button"
                    class="edit-entry-btn"
                    data-id="${entry.id}"
                    data-type="${entry._type}"
                    aria-label="${interpolate(t('aria_edit_entry', 'Edit {type} entry: {title}'), {
                        type: isIncome
                            ? t('history_entry_income', 'income')
                            : t('history_entry_expense', 'expense'),
                        title
                    })}"
                >
                ${t('action_edit', 'Edit')}
                </button>

                <button
                    type="button"
                    class="delete-entry-btn"
                    data-id="${entry.id}"
                    data-type="${entry._type}"
                    aria-label="${interpolate(t('aria_delete_entry', 'Delete {type} entry: {title}'), {
                        type: isIncome
                            ? t('history_entry_income', 'income')
                            : t('history_entry_expense', 'expense'),
                        title
                    })}"
                >
                    ${t('action_delete', 'Delete')}
                </button>
            </div>
        </div>
    </article>
`;
        }).join('');

        // wire delete buttons
        list.querySelectorAll('.delete-entry-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const confirmed = confirm('Delete this entry?');
                if (!confirmed) return;
                const { id, type } = btn.dataset;
                const endpoint = type === 'income' ? `/api/income/${id}` : `/api/expenses/${id}`;

                try {
                    const res = await fetch(endpoint, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        loadAll();
                    } else {
                        alert('Failed to delete entry.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('An error occurred.');
                }
            });
        });

        // wire edit buttons
        list.querySelectorAll('.edit-entry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const { id, type } = btn.dataset;
                const entry = type === 'income'
                    ? allIncome.find(i => String(i.id) === id)
                    : allExpenses.find(e => String(e.id) === id);
                if (entry) openEditModal(entry, type);
            });
        });
    }
    // ── edit modal ──
    let editingId = null;
    let editingType = null;

    function openEditModal(entry, type) {
        editingId = entry.id;
        editingType = type;


        document.getElementById('editEntryTitle').textContent =
            type === 'income'
                ? t('edit_income_entry_title', 'Edit Income Entry')
                : t('edit_expense_entry_title', 'Edit Expense Entry');
        document.getElementById('editAmount').value = parseFloat(entry.amount).toFixed(2);
        document.getElementById('editCategory').value = entry.category || '';
        document.getElementById('editEntryDate').value = entry.entry_date ? entry.entry_date.split('T')[0] : '';
        document.getElementById('editNotes').value = entry.notes || '';

        const sourceWrapper = document.getElementById('editSourceWrapper');
        if (type === 'income') {
            sourceWrapper.style.display = 'block';
            document.getElementById('editSource').value = entry.source || '';
        } else {
            sourceWrapper.style.display = 'none';
            document.getElementById('editSource').value = '';
        }

        document.getElementById('editEntryModal').style.display = 'flex';
    }

    function closeEditModal() {
        document.getElementById('editEntryModal').style.display = 'none';
        editingId = null;
        editingType = null;
    }

    document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);

    document.getElementById('editEntryModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('editEntryModal')) closeEditModal();
    });

    document.getElementById('editSaveBtn').addEventListener('click', async () => {
        const amount = parseFloat(document.getElementById('editAmount').value);
        const category = document.getElementById('editCategory').value.trim();
        const entry_date = document.getElementById('editEntryDate').value || null;
        const notes = document.getElementById('editNotes').value.trim();
        const source = document.getElementById('editSource').value.trim();

        if (!amount || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }

        const endpoint = editingType === 'income'
            ? `/api/income/${editingId}`
            : `/api/expenses/${editingId}`;

        const payload = editingType === 'income'
            ? { amount, source, category, entry_date, notes }
            : { amount, category, entry_date, notes };

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (res.ok) {
                closeEditModal();
                loadAll();
            } else {
                alert(result.error || 'Failed to update entry.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    });

    // ── chart view segmented control ──
    document.querySelectorAll('#chartViewToggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#chartViewToggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chartView = btn.dataset.view;
            renderChart();
        });
    });

    document.querySelectorAll('#chartModeToggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#chartModeToggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            chartMode = btn.dataset.mode;
            renderChart();
        });
    });

    // ── time filter ──
    document.querySelectorAll('#timeFilter button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#timeFilter button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timeRange = btn.dataset.range;
            document.getElementById('customRangeInputs').style.display =
                timeRange === 'custom' ? 'flex' : 'none';
            if (timeRange !== 'custom') renderChart();
        });
    });

    document.getElementById('applyCustomRange').addEventListener('click', () => {
        customFrom = document.getElementById('customFrom').value || null;
        customTo = document.getElementById('customTo').value || null;
        renderChart();
    });

    function getStoredDate(value) {
        if (!value) return '';

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '';

        return formatLocalDate(parsed);
    }

    function formatDisplayDate(value) {
        const datePart = getStoredDate(value);
        if (!datePart) return '';

        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
    }

    function getDateBounds() {
        const now = new Date();
        let from;
        let to;

        if (timeRange === 'week') {
            const day = now.getDay();

            const start = new Date(now);
            start.setDate(now.getDate() - day);

            const end = new Date(start);
            end.setDate(start.getDate() + 6);

            from = formatLocalDate(start);
            to = formatLocalDate(end);

        } else if (timeRange === 'month') {
            from = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
            to = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        } else if (timeRange === 'year') {
            from = formatLocalDate(new Date(now.getFullYear(), 0, 1));
            to = formatLocalDate(new Date(now.getFullYear(), 11, 31));

        } else if (timeRange === 'custom' && customFrom && customTo) {
            from = customFrom;
            to = customTo;

        } else {
            from = '0000-01-01';
            to = today;
        }

        return { from, to };
    }

    function filterByDate(entries) {
        const { from, to } = getDateBounds();

        return entries.filter(entry => {
            const entryDate = getStoredDate(entry.entry_date || entry.created_at);
            return entryDate && entryDate >= from && entryDate <= to;
        });
    }

    // ── group by category for bar/donut ──
    function groupByKey(
        entries, 
        keyName, 
        fallback = t('chart_uncategorised', 'Uncategorised')
    ) {
        const map = {};
        entries.forEach(entry => {
            const rawKey = (entry[keyName] || '').trim();

            const key = rawKey
                ? getCategoryLabel(rawKey)
                : fallback;

            map[key] = (map[key] || 0) + parseFloat(entry.amount);
        });
        return map;
    }

    function createBarDataset(label, data, backgroundColor) {
        return {
            label,
            data,
            backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 0,
            borderRadius: 4,
            categoryPercentage: 0.55,
            barPercentage: 0.7,
            maxBarThickness: 50
        };
    }

    // ── render chart ──
    function renderChart() {
        const ctx = document.getElementById('trackerChart').getContext('2d');
        if (trackerChart) trackerChart.destroy();

        const filteredIncome = filterByDate(allIncome);
        const filteredExpenses = filterByDate(allExpenses);

        const totalIncome = filteredIncome.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
        const totalExpenses = filteredExpenses.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
        const net = totalIncome - totalExpenses;

        const summary = document.getElementById('chartSummary');
        summary.innerHTML = `
        ${t('chart_income', 'Income')}: <span style="color:var(--text-green)">€${totalIncome.toFixed(2)}</span>
        &nbsp;&nbsp;
        ${t('chart_expenses', 'Expenses')}: <span style="color:var(--text-red)">€${totalExpenses.toFixed(2)}</span>
        &nbsp;&nbsp;
        ${t('chart_net', 'Net')}: <span class="${net >= 0 ? 'net-positive' : 'net-negative'}">€${net.toFixed(2) }</span>
        `;

        const incomePalette = [
            '#6aab6a', '#7fbc7f', '#94cd94', '#579957',
            '#a8d9a8', '#bddfbd', '#4b874b', '#8fc48f'
        ]

        const expensePalette = [
            '#965E5E', '#b88a8a', '#d4b0b0', '#7a4d4d',
            '#c49a9a', '#e2c8c8', '#8c6b6b', '#a87e7e'
        ];

        if (chartMode === 'totals') {
            if (chartView === 'income') {
                trackerChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [t('chart_income', 'Income')],
                        datasets: [
                            createBarDataset(
                                `${t('chart_income', 'Income')} (€)`,
                                [totalIncome],
                                '#5f925f'
                            )
                        ]
                    },
                    options: chartOptions(t('chart_total_income', 'Total Income'))
                });
                return;
            }

            if (chartView === 'expenses') {
                trackerChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [t('chart_expenses', 'Expenses')],
                        datasets: [
                            createBarDataset(
                                `${t('chart_expenses', 'Expenses')} (€)`,
                                [totalExpenses],
                                '#a85f5f'
                            )
                        ]
                    },
                    options: chartOptions(t('chart_total_expenses', 'Total Expenses'))
                });
                return;
            }

            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: [t('chart_selected_period', 'Selected Period')],
                    datasets: [
                        createBarDataset(t('chart_income', 'Income'), [totalIncome], '#6aab6a'),
                        createBarDataset(t('chart_expenses', 'Expenses'), [totalExpenses], '#965E5E')
                    ]
                },
                options: chartOptions(t('chart_income_vs_expenses', 'Income vs Expenses'))
            });
            return;
        }

        if (chartView === 'income') {
            const grouped = groupByKey(filteredIncome, 'category');
            const labels = Object.keys(grouped);
            const data = Object.values(grouped);

            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        createBarDataset(t('chart_income', 'Income') + ' (€)', data, incomePalette.slice(0, labels.length))
                    ]
                },
                options: chartOptions(t('chart_income_by_category', 'Income by Category'))
            });
            return;
        }

        if (chartView === 'expenses') {
            const grouped = groupByKey(filteredExpenses, 'category');
            const labels = Object.keys(grouped);
            const data = Object.values(grouped);

            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        createBarDataset(t('chart_expenses', 'Expenses') + ' (€)', data, expensePalette.slice(0, labels.length))
                    ]
                },
                options: chartOptions(t('chart_expenses_by_category', 'Expenses by Category'))
            });
            return;
        }

        const incomeMap = groupByKey(filteredIncome, 'category');
        const expenseMap = groupByKey(filteredExpenses, 'category');
        const labels = [...new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)])];

        trackerChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    createBarDataset(
                        t('chart_income', 'Income'),
                        labels.map(label => incomeMap[label] || 0),
                        incomePalette.slice(0, labels.length)
                    ),
                    createBarDataset(
                        t('chart_expenses', 'Expenses'),
                        labels.map(label => expenseMap[label] || 0),
                        expensePalette.slice(0, labels.length)
                    )
                ]
            },
            options: chartOptions(t('chart_income_vs_expenses_by_category', 'Income vs Expenses by Category'))
        });
    }

    // ── shared chart options ──
    function chartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#9b6363',
                        font: { family: 'Inter', size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: title,
                    color: '#9b6363',
                    font: { family: 'Kaisei Tokumin', size: 13 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` €${parseFloat(ctx.parsed.y).toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#9f998e', font: { size: 11 } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    ticks: {
                        color: '#9f998e',
                        font: { size: 11 },
                        callback: val => `€${val}`
                    },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    beginAtZero: true
                }
            }
        };
    }
    // ── initial load ──
    loadAll();

    document.addEventListener('languageChanged', () => {
        renderHistory();
        renderChart();
    });
});