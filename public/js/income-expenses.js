//income-expenses.js
document.addEventListener('DOMContentLoaded', async () => {
    // token authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }

    //default date to today
    const today = new Date().toISOString().split('T')[0];
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
        const incomeOpen = !incomeQuickBar.hasAttribute('hidden');
        const expenseOpen = !expenseQuickBar.hasAttribute('hidden');

        if (incomeOpen && typeToOpen !== 'income' && incomeFormHasValues()) {
            return confirm('Discard your unsaved income entry?');
        }

        if (expenseOpen && typeToOpen !== 'expense' && expenseFormHasValues()) {
            return confirm('Discard your unsaved expense entry?');
        }

        return true;
    }

    function closeIncomeBar(reset = false) {
        incomeQuickBar.hidden = true;
        openIncomeBarBtn.classList.remove('active');
        openIncomeBarBtn.setAttribute('aria-expanded', 'false');

        if (reset) {
            resetIncomeForm();
        }
    }

    function closeExpenseBar(reset = false) {
        expenseQuickBar.hidden = true;
        openExpenseBarBtn.classList.remove('active');
        openExpenseBarBtn.setAttribute('aria-expanded', 'false');

        if (reset) {
            resetExpenseForm();
        }
    }

    function openIncomeBar() {
        if (!confirmDiscardIfNeeded('income')) return;

        closeExpenseBar(true);
        incomeQuickBar.hidden = false;
        openIncomeBarBtn.classList.add('active');
        openIncomeBarBtn.setAttribute('aria-expanded', 'true');
        openExpenseBarBtn.setAttribute('aria-expanded', 'false');
        document.getElementById('incAmount').focus();
    }

    function openExpenseBar() {
        if (!confirmDiscardIfNeeded('expense')) return;

        closeIncomeBar(true);
        expenseQuickBar.hidden = false;
        openExpenseBarBtn.classList.add('active');
        openExpenseBarBtn.setAttribute('aria-expanded', 'true');
        openIncomeBarBtn.setAttribute('aria-expanded', 'false');
        document.getElementById('expAmount').focus();
    }

    openIncomeBarBtn.addEventListener('click', () => {
        const isOpen = !incomeQuickBar.hasAttribute('hidden');

        if (isOpen) {
            if (!confirmDiscardIfNeeded()) return;
            closeIncomeBar(true);
            return;
        }

        openIncomeBar();
    });

    openExpenseBarBtn.addEventListener('click', () => {
        const isOpen = !expenseQuickBar.hasAttribute('hidden');

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

    function resolveCategory(selectId, customId){
        const select = document.getElementById(selectId);
        const custom = document.getElementById(customId);
        return select.value === 'Other' ? custom.value.trim() : select.value;
    }

    //default states of input/selections/options
    let allIncome = [];
    let allExpenses = [];
    let historyFilter = 'all';
    let chartView = 'income';
    let timeRange = 'month';
    let customFrom = null;
    let customTo = null;
    let trackerChart = null;

    //fetch data
    async function loadAll(){
        try{
            const [incRes, expRes] = await Promise.all([ 
                fetch('/api/income', { headers: { 'Authorization' : `Bearer ${token}`} }),
                fetch('/api/expenses', { headers: { 'Authorization' : `Bearer ${token}`} })
            ]);
            allIncome = await incRes.json();
            allExpenses = await expRes.json();
            if(!Array.isArray(allIncome)) allIncome = [];
            if(!Array.isArray(allExpenses)) allExpenses = [];
            renderHistory();
            renderChart();
        }
        catch(err){
            console.error('Could not load data: ', err);
        }
    }

    //save an expense
    document.getElementById('saveExpenseBtn').addEventListener('click', async () =>{
        const amount = parseFloat(document.getElementById('expAmount').value);
        const date = document.getElementById('expDate').value;
        const category = resolveCategory('expCategory', 'expCategoryCustom');
        const notes = document.getElementById('expNotes').value.trim();

        if(!amount || amount <= 0){
            alert('Please enter a valid amount.');
            return;
        }

        try{
            const res =  await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, category, entry_date: date || today, notes })
            });
            const result = await res.json();
            if(res.ok){
                resetExpenseForm();
                closeExpenseBar();
                loadAll();
            }
            else{
                alert(result.error || 'Failed to save expense.');
            }
        }
        catch(err){
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
    function renderHistory(){
        const list = document.getElementById('historyList');

        let entries = [];
        if(historyFilter === 'all' || historyFilter === 'income'){
            allIncome.forEach(item => entries.push({ ...item, _type: 'income'}));
        }
        if(historyFilter === 'all' || historyFilter === 'expenses'){
            allExpenses.forEach(item => entries.push({ ...item, _type: 'expense' }));
        }

        //sort by entry_date desceding, fall back to create_at
        entries.sort((a, b) => {
            const da = new Date(a.entry_date || a.created_at);
            const db = new Date(b.entry_date || b.created_at);
            return db - da;
        });
        
        if(entries.length === 0){
            list.innerHTML = `<p class="history-empty">No entries yet.</p>`;
            return;
        }

        list.innerHTML = entries.map(entry => `
            <div class="history-item">
                <div class="history-item-left">
                    <span class="history-item-label">
                        ${entry._type === 'income' ? (entry.source || 'Income') : (entry.category || 'Expense')}
                    </span>
                    <span class="history-item-meta">
                        ${entry.category || ''}
                        ${entry.entry_date ? '&middot; ' + new Date(entry.entry_date).toLocaleDateString('en-IE') : ''}
                    </span>
                </div>
                <div class="history-item-right">
                    <span class="history-amount ${entry._type}">
                        ${entry._type === 'income' ? '+' : '-'}€${parseFloat(entry.amount).toFixed(2)}
                    </span>
                    <div class="history-item-actions">
                        <button class="edit-entry-btn" data-id="${entry.id}" data-type="${entry._type}">edit</button>
                        <button class="delete-entry-btn" data-id="${entry.id}" data-type="${entry._type}">delete</button>
                    </div>
                </div>
            </div>
        `).join('');

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

        document.getElementById('editEntryTitle').textContent = type === 'income' ? 'Edit Income Entry' : 'Edit Expense Entry';
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

    // ── date filtering helpers ──
    function getDateBounds() {
        const now = new Date();
        let from, to;

        if (timeRange === 'week') {
            const day = now.getDay();
            from = new Date(now);
            from.setDate(now.getDate() - ((day + 6) % 7)); // Monday
            from.setHours(0, 0, 0, 0);
            to = new Date(now);
            to.setHours(23, 59, 59, 999);
        } else if (timeRange === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (timeRange === 'year') {
            from = new Date(now.getFullYear(), 0, 1);
            to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        } else if (timeRange === 'custom' && customFrom && customTo) {
            from = new Date(customFrom);
            to = new Date(customTo);
            to.setHours(23, 59, 59, 999);
        } else {
            from = new Date(0);
            to = new Date();
        }
        return { from, to };
    }

    function filterByDate(entries) {
        const { from, to } = getDateBounds();
        return entries.filter(e => {
            const d = new Date(e.entry_date || e.created_at);
            return d >= from && d <= to;
        });
    }

    // ── group by category for bar/donut ──
    function groupByCategory(entries) {
        const map = {};
        entries.forEach(e => {
            const key = e.category || 'Uncategorised';
            map[key] = (map[key] || 0) + parseFloat(e.amount);
        });
        return map;
    }

    // ── render chart ──
    function renderChart() {
        const ctx = document.getElementById('trackerChart').getContext('2d');
        if (trackerChart) trackerChart.destroy();

        const filteredIncome = filterByDate(allIncome);
        const filteredExpenses = filterByDate(allExpenses);

        const totalIncome = filteredIncome.reduce((s, e) => s + parseFloat(e.amount), 0);
        const totalExpenses = filteredExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
        const net = totalIncome - totalExpenses;

        // update summary strip
        const summary = document.getElementById('chartSummary');
        summary.innerHTML = `
            Income: <span style="color:var(--text-green)">€${totalIncome.toFixed(2)}</span>
            &nbsp;&nbsp;
            Expenses: <span style="color:var(--text-red)">€${totalExpenses.toFixed(2)}</span>
            &nbsp;&nbsp;
            Net: <span class="${net >= 0 ? 'net-positive' : 'net-negative'}">€${net.toFixed(2)}</span>
        `;

        const palette = [
            '#965E5E', '#b88a8a', '#d4b0b0', '#7a4d4d',
            '#c49a9a', '#e2c8c8', '#8c6b6b', '#a87e7e'
        ];

        if (chartView === 'income') {
            const grouped = groupByCategory(filteredIncome);
            const labels = Object.keys(grouped);
            const data = Object.values(grouped);

            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Income (€)',
                        data,
                        backgroundColor: palette.slice(0, labels.length),
                        borderRadius: 4
                    }]
                },
                options: chartOptions('Income by Category')
            });

        } else if (chartView === 'expenses') {
            const grouped = groupByCategory(filteredExpenses);
            const labels = Object.keys(grouped);
            const data = Object.values(grouped);

            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Expenses (€)',
                        data,
                        backgroundColor: palette.slice(0, labels.length),
                        borderRadius: 4
                    }]
                },
                options: chartOptions('Expenses by Category')
            });

        } else if (chartView === 'comparison') {
            trackerChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Selected Period'],
                    datasets: [
                        {
                            label: 'Income',
                            data: [totalIncome],
                            backgroundColor: '#6aab6a',
                            borderRadius: 4
                        },
                        {
                            label: 'Expenses',
                            data: [totalExpenses],
                            backgroundColor: '#965E5E',
                            borderRadius: 4
                        }
                    ]
                },
                options: chartOptions('Income vs Expenses')
            });
        }
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
});