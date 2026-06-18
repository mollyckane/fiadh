// invoices.js
document.addEventListener('DOMContentLoaded', () => {

// token authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/index.html';
}

// logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });
}

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


// elements
const itemsBody = document.getElementById('invoiceItemsBody');
const addItemBtn = document.getElementById('addItemButton');
const vatCheckbox = document.getElementById('vatEnabled');
const vatRateContainer = document.getElementById('vatRateContainer');
const vatRateInput = document.getElementById('vatRate');
const subtotalDisplay = document.getElementById('subtotalDisplay');
const vatDisplay = document.getElementById('vatDisplay');
const totalDisplay = document.getElementById('totalDisplay');
const saveBtn = document.getElementById('saveInvoiceButton');

// hide VAT rate input by default
if (vatRateContainer) vatRateContainer.style.display = 'none';

// recalculate one row
function recalcRow(row) {
    const qty = parseFloat(row.querySelector('[name="itemQuantity"]')?.value) || 0;
    const rate = parseFloat(row.querySelector('[name="itemRate"]')?.value) || 0;
    const totalInput = row.querySelector('[name="itemTotal"]');
    if (totalInput) totalInput.value = (qty * rate).toFixed(2);
}

// recalculate total
function recalcTotals() {
    let subtotal = 0;
    itemsBody.querySelectorAll('.invoice-item-row').forEach(row => {
        subtotal += parseFloat(row.querySelector('[name="itemTotal"]')?.value) || 0;
    });

    const vatOn = vatCheckbox?.checked || false;
    const vatRate = vatOn ? (parseFloat(vatRateInput?.value) || 0) / 100 : 0;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    if (subtotalDisplay) subtotalDisplay.textContent = subtotal.toFixed(2);
    if (vatDisplay) vatDisplay.textContent = vatAmount.toFixed(2);
    if (totalDisplay) totalDisplay.textContent = total.toFixed(2);
}

// wire row
function wireRow(row) {
    row.querySelectorAll('[name="itemQuantity"], [name="itemRate"]').forEach(input => {
        input.addEventListener('input', () => {
            recalcRow(row);
            recalcTotals();
        });
    });

    const removeBtn = row.querySelector('.remove-item');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            if (itemsBody.querySelectorAll('.invoice-item-row').length <= 1) {
                alert('You must have at least one line item.');
                return;
            }
            row.remove();
            recalcTotals();
        });
    }
}

// create new row
function createRow() {
    const row = document.createElement('div');
    row.classList.add('invoice-item-row', 'item-row');
    row.innerHTML = `
        <div class="item-field">
            <label>Description</label>
            <input type="text" name="itemDescription" placeholder="Description" />
        </div>
        <div class="item-field">
            <label>Quantity</label>
            <input type="number" name="itemQuantity" step="1" min="0" value="1" />
        </div>
        <div class="item-field">
            <label>Rate (€)</label>
            <input type="number" name="itemRate" step="0.01" min="0" value="0.00" />
        </div>
        <div class="item-field">
            <label>Line total</label>
            <input type="text" name="itemTotal" readonly />
        </div>
        <button type="button" class="remove-item">Remove</button>
    `;
    return row;
}

//add row
function addRow() {
    const row = createRow();
    itemsBody.appendChild(row);
    recalcRow(row);
    wireRow(row);
    recalcTotals();
}

// Add the first row on page load
addRow();

if (addItemBtn) addItemBtn.addEventListener('click', addRow);

// vat toggle
if (vatCheckbox) {
    vatCheckbox.addEventListener('change', () => {
        if (vatRateContainer) {
            vatRateContainer.style.display = vatCheckbox.checked ? 'block' : 'none';
        }
        recalcTotals();
    });
}

if (vatRateInput) vatRateInput.addEventListener('input', recalcTotals);

// save invoice
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const clientName = document.getElementById('clientName')?.value.trim();
        const clientEmail = document.getElementById('clientEmail')?.value.trim();
        const dueDate = document.getElementById('dueDate')?.value || null;
        const status = document.getElementById('status')?.value;
        const notes = document.getElementById('notes')?.value.trim();

        if (!clientName) {
            alert('Please enter a client name.');
            return;
        }

        const descriptions = [];
        itemsBody.querySelectorAll('.invoice-item-row').forEach(row => {
            const desc = row.querySelector('[name="itemDescription"]')?.value.trim();
            if (desc) descriptions.push(desc);
        });

        const subtotal = parseFloat(subtotalDisplay?.textContent) || 0;
        const vatAmount = parseFloat(vatDisplay?.textContent) || 0;
        const total = parseFloat(totalDisplay?.textContent) || 0;

        const payload = {
            client_name: clientName,
            client_email: clientEmail,
            description: descriptions.join(', '),
            amount: subtotal,
            vat_enabled: vatCheckbox?.checked || false,
            vat_amount: vatAmount,
            total,
            status,
            due_date: dueDate,
            notes
        };

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Invoice saved!');
                loadInvoiceHistory();
            } else {
                alert(result.error || result.message || 'Failed to save invoice.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred. Please try again.');
        }
    });
}

// invoice history
async function loadInvoiceHistory() {
    const historySection = document.querySelector('.invoice-history');
    if (!historySection) return;

    try {
        const response = await fetch('/api/invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const invoices = await response.json();

        if (!Array.isArray(invoices) || invoices.length === 0) {
            historySection.innerHTML = `
        <p>Invoice History</p>
        <p style="font-size:0.85rem; color:#9a9494; margin-top:0.5rem;">No invoices saved yet.</p>
    `;
            return;
        }

        historySection.innerHTML = `
    <p>Invoice History</p>
    <div style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.5rem;">
        ${invoices.map(inv => `
        <div style="font-size:0.82rem; border-bottom:1px solid var(--border-color-secondary); padding-bottom:0.4rem;">
            <div style="display: flex; justify-content:space-between; align-items: center;"><strong>${inv.client_name}</strong>
                <div>
                    <button class="edit-btn" data-id="${inv.id}">edit</button>
                    <button class="delete-btn" data-id="${inv.id}">delete</button>
                </div>
        </div>
            €${parseFloat(inv.total).toFixed(2)} &middot; <span class="status-pill ${inv.status}"> ${inv.status}</span>
            ${inv.due_date ? `&middot; Due: ${new Date (inv.due_date).toLocaleDateString('en-IE')}` : ''}
        </div>
        `).join('')}
    </div>
    `;

    historySection.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id= btn.dataset.id;
            const confirmed = confirm('Are you sure you want to delete this invoice?');
            if(confirmed){
                try {
                    const response = await fetch(`/api/invoices/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert('Invoice deleted!');
                        loadInvoiceHistory();
                    } else {
                        alert(result.error || result.message || 'Failed to delete invoice.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('An error occurred. Please try again.');
                }
            }
        });
    });
    historySection.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id= btn.dataset.id;
            //TODO: open edit modal/form for this invoice
            console.log('Edit invoice: ', id);
        });
    });

    } catch (err) {
        console.error('Could not load invoice history:', err);
    }
}
loadInvoiceHistory();

});
