// invoices.js
document.addEventListener('DOMContentLoaded', async () => {

    // token authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
    }

    let currentUser = {};

    try{
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization' : `Bearer ${token}`}
        });
        currentUser = await res.json();
    }
    catch (err){
        console.error('Could not load user: ', err);
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
    const exportPdfBtn = document.getElementById('exportPdfBtn');

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

    function resetForm() {
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientAddress').value = '';
        document.getElementById('dueDate').value = '';
        document.getElementById('status').value = 'draft';
        document.getElementById('notes').value = '';

        // reset VAT
        if (vatCheckbox) vatCheckbox.checked = false;
        if (vatRateContainer) vatRateContainer.style.display = 'none';
        if (vatRateInput) vatRateInput.value = '';

        // clear all rows and add one fresh empty row
        itemsBody.innerHTML = '';
        addRow();

        // reset totals display
        if (subtotalDisplay) subtotalDisplay.textContent = '0.00';
        if (vatDisplay) vatDisplay.textContent = '0.00';
        if (totalDisplay) totalDisplay.textContent = '0.00';
    }

    // save invoice
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const clientName = document.getElementById('clientName')?.value.trim();
            const clientEmail = document.getElementById('clientEmail')?.value.trim();
            const clientAddress = document.getElementById('clientAddress')?.value.trim();
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

            // build items array
            const items = [];
            itemsBody.querySelectorAll('.invoice-item-row').forEach(row => {
                items.push({
                    description: row.querySelector('[name="itemDescription"]')?.value || '',
                    quantity: row.querySelector('[name="itemQuantity"]')?.value || '0',
                    rate: row.querySelector('[name="itemRate"]')?.value || '0.00',
                    total: row.querySelector('[name="itemTotal"]')?.value || '0.00'
                });
            });

            const payload = {
                client_name: clientName,
                client_email: clientEmail,
                client_address: clientAddress,
                description: descriptions.join(', '),
                amount: subtotal,
                vat_enabled: vatCheckbox?.checked || false,
                vat_amount: vatAmount,
                total,
                status,
                due_date: dueDate,
                notes,
                items,
                invoice_number: document.getElementById('invoiceNumber')?.value.trim() || null
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
                    const exportNow = confirm('Invoice saved! Would you like to export now?');
                    if(exportNow){
                        generateInvoicePDF({ ...payload, items }, currentUser);
                    }
                    resetForm();
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
                        <button class="view-edit-btn" data-id="${inv.id}">view/edit</button>
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
        historySection.querySelectorAll('.view-edit-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id= btn.dataset.id;

                try{
                    const res = await fetch(`/api/invoices/${id}`, {
                        headers: { 'Authorization' : `Bearer ${token}` }
                    });
                    const inv = await res.json();
                    openModal(inv);
                }
                catch (err){
                    console.error(err);
                    alert('Could not load invoice.');
                }
                //TODO: open edit modal/form for this invoice
                console.log('Edit invoice: ', id);
            });
        });

        } catch (err) {
            console.error('Could not load invoice history:', err);
        }
    }
    loadInvoiceHistory();

    // reusable PDF generator 
    function generateInvoicePDF(inv, user) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const margin = 20;
        let y = 20;

        // brand + user details
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Fiadh', margin, y);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${user.fname} ${user.lname}`, margin, y + 6);
        doc.text(user.email || '', margin, y + 11);

        // invoice title + meta
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice', 190, y, { align: 'right' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-IE')}`, 190, y + 6, { align: 'right' });
        doc.text(`Due: ${inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IE') : 'N/A'}`, 190, y + 11, { align: 'right' });
        doc.text(`Status: ${inv.status || ''}`, 190, y + 16, { align: 'right' });

        y += 30;
        doc.setDrawColor(200);
        doc.line(margin, y, 190, y);
        y += 8;

        // client details
        doc.setFont('helvetica', 'bold');
        doc.text('Billed To:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(inv.client_name || '', margin, y + 6);
        if (inv.client_email) doc.text(inv.client_email, margin, y + 12);
        if (inv.client_address) {
            const addressLines = doc.splitTextToSize(inv.client_address, 80);
            doc.text(addressLines, margin, y + 18);
            y += (addressLines.length * 6) + 24;
        } else {
            y += 24;
        }
        doc.line(margin, y, 190, y);
        y += 8;

        // line items header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Description', margin, y);
        doc.text('Qty', 120, y);
        doc.text('Rate ( € )', 145, y);
        doc.text('Total ( € )', 175, y);
        y += 5;
        doc.line(margin, y, 190, y);
        y += 6;

        // line items rows
        doc.setFont('helvetica', 'normal');
        const items = inv.items || [];
        items.forEach(item => {
            console.log('PDF item:', item);
            doc.text(item.description || item.desc || '', margin, y);
            doc.text(String(item.quantity || item.qty || '0'), 120, y);
            doc.text(`EUR ${parseFloat(item.rate).toFixed(2)}`, 145, y);
            doc.text(`EUR ${parseFloat(item.total || item.tot).toFixed(2)}`, 175, y);
            y += 7;
        });

        y += 4;
        doc.line(margin, y, 190, y);
        y += 8;

        // totals
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: € ${parseFloat(inv.amount).toFixed(2)}`, 190, y, { align: 'right' });
        doc.text(`VAT: € ${parseFloat(inv.vat_amount).toFixed(2)}`, 190, y + 6, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: € ${parseFloat(inv.total).toFixed(2)}`, 190, y + 12, { align: 'right' });

        // notes
        if (inv.notes) {
            y += 24;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text('Notes:', margin, y);
            const noteLines = doc.splitTextToSize(inv.notes, 170);
            doc.text(noteLines, margin, y + 6);
        }

        doc.save(`${inv.client_name || 'invoice'}-invoice.pdf`);
    }


    // export from form
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            // build items array from current form rows
            const items = [];
            itemsBody.querySelectorAll('.invoice-item-row').forEach(row => {
                items.push({
                    desc: row.querySelector('[name="itemDescription"]')?.value || '',
                    qty: row.querySelector('[name="itemQuantity"]')?.value || '0',
                    rate: row.querySelector('[name="itemRate"]')?.value || '0.00',
                    tot: row.querySelector('[name="itemTotal"]')?.value || '0.00'
                });
            });
            

            // build invoice object from form
            const inv = {
                client_name: document.getElementById('clientName')?.value.trim(),
                client_email: document.getElementById('clientEmail')?.value.trim(),
                client_address: document.getElementById('clientAddress')?.value.trim(),
                due_date: document.getElementById('dueDate')?.value || null,
                status: document.getElementById('status')?.value,
                notes: document.getElementById('notes')?.value.trim(),
                amount: subtotalDisplay?.textContent || '0.00',
                vat_amount: vatDisplay?.textContent || '0.00',
                total: totalDisplay?.textContent || '0.00',
                items
            };

            generateInvoicePDF(inv, currentUser);
        });
    }

    // modal state
    let currentModalInvoice = null;

    function openModal(inv) {
        currentModalInvoice = inv;

        // populate view mode
        document.getElementById('viewInvoiceNumber').textContent = inv.invoice_number || '--';
        document.getElementById('viewStatus').textContent = inv.status || '';
        document.getElementById('viewInvoiceDate').textContent = inv.created_at
            ? new Date(inv.created_at).toLocaleDateString('en-IE') : '--';
        document.getElementById('viewDueDate').textContent = inv.due_date
            ? new Date(inv.due_date).toLocaleDateString('en-IE') : 'N/A';
        document.getElementById('viewClientName').textContent = inv.client_name || '';
        document.getElementById('viewClientEmail').textContent = inv.client_email || '';
        document.getElementById('viewClientAddress').textContent = inv.client_address || '';
        document.getElementById('viewSubtotal').textContent = parseFloat(inv.amount).toFixed(2);
        document.getElementById('viewVat').textContent = parseFloat(inv.vat_amount).toFixed(2);
        document.getElementById('viewTotal').textContent = parseFloat(inv.total).toFixed(2);
        document.getElementById('viewNotes').textContent = inv.notes || '';

        // populate items table
        const tbody = document.getElementById('viewItemsBody');
        tbody.innerHTML = '';
        const items = inv.items || [];
        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="color:var(--text-color-secondary); font-size:0.8rem;">No line items recorded.</td></tr>`;
        } else {
            items.forEach(item => {
                tbody.innerHTML += `
                <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity || ''}</td>
                    <td>EUR ${parseFloat(item.rate).toFixed(2)}</td>
                    <td>EUR ${parseFloat(item.total).toFixed(2)}</td>
                </tr>`;
            });
        }

        // make sure we start in view mode
        document.getElementById('viewMode').style.display = 'block';
        document.getElementById('editMode').style.display = 'none';
        document.getElementById('editActions').style.display = 'none';
        document.getElementById('viewActions').style.display = 'block';
        document.getElementById('invoiceModal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('invoiceModal').style.display = 'none';
        currentModalInvoice = null;
    }

    //edit line items in modal
    function addEditRow(container, item = {}) {
        const row = document.createElement('div');
        row.classList.add('invoice-item-row', 'item-row');
        row.innerHTML = `
            <div class="item-field">
                <label>Description</label>
                <input type="text" name="editItemDescription" value="${item.description || ''}" />
            </div>
            <div class="item-field">
                <label>Quantity</label>
                <input type="number" name="editItemQuantity" step="1" min="0" value="${item.quantity || 1}" />
            </div>
            <div class="item-field">
                <label>Rate (€)</label>
                <input type="number" name="editItemRate" step="0.01" min="0" value="${item.rate || '0.00'}" />
            </div>
            <div class="item-field">
                <label>Line total</label>
                <input type="text" name="editItemTotal" readonly value="${item.total || '0.00'}" />
            </div>
            <button type="button" class="remove-item">Remove</button>
        `;
        row.querySelectorAll('[name="editItemQuantity"], [name="editItemRate"]').forEach(input => {
            input.addEventListener('input', () => {
                const qty = parseFloat(row.querySelector('[name="editItemQuantity"]').value) || 0;
                const rate = parseFloat(row.querySelector('[name="editItemRate"]').value) || 0;
                row.querySelector('[name="editItemTotal"]').value = (qty * rate).toFixed(2);
                recalcEditTotals(container);
            });
        });
        row.querySelector('.remove-item').addEventListener('click', () => {
            if (container.querySelectorAll('.invoice-item-row').length <= 1) {
                alert('You must have at least one line item.');
                return;
            }
            row.remove();
            recalcEditTotals(container);
        });
        container.appendChild(row);
        recalcEditTotals(container);
    }

    function recalcEditTotals(container) {
        let subtotal = 0;
        container.querySelectorAll('[name="editItemTotal"]').forEach(input => {
            subtotal += parseFloat(input.value) || 0;
        });

        const vatCheckbox = document.getElementById('editVatEnabled');
        const vatRateInput = document.getElementById('editVatRate');
        const vatOn = vatCheckbox?.checked || false;
        const vatRate = vatOn ? (parseFloat(vatRateInput?.value) || 0) / 100 : 0;
        const vatAmount = subtotal * vatRate;
        const total = subtotal + vatAmount;

        document.getElementById('editSubtotal').textContent = subtotal.toFixed(2);
        document.getElementById('editVat').textContent = vatAmount.toFixed(2);
        document.getElementById('editTotal').textContent = total.toFixed(2);
    }

    //switch to edit mode in modal
    function switchToEditMode() {
        const inv = currentModalInvoice;

        // pre-fill edit fields
        document.getElementById('editInvoiceNumber').value = inv.invoice_number || '';
        document.getElementById('editStatus').value = inv.status || 'draft';
        document.getElementById('editDueDate').value = inv.due_date
            ? inv.due_date.split('T')[0] : '';
        document.getElementById('editClientName').value = inv.client_name || '';
        document.getElementById('editClientEmail').value = inv.client_email || '';
        document.getElementById('editClientAddress').value = inv.client_address || '';
        document.getElementById('editNotes').value = inv.notes || '';

        const editItemsBody = document.getElementById('editItemsBody');

        // pre-fill VAT
        const editVatCheckbox = document.getElementById('editVatEnabled');
        const editVatRateContainer = document.getElementById('editVatRateContainer');
        const editVatRateInput = document.getElementById('editVatRate');

        editVatCheckbox.checked = !!inv.vat_enabled;
        editVatRateContainer.style.display = inv.vat_enabled ? 'block' : 'none';

        // wire VAT toggle
        editVatCheckbox.onchange = () => {
            editVatRateContainer.style.display = editVatCheckbox.checked ? 'block' : 'none';
            recalcEditTotals(editItemsBody);
        };
        editVatRateInput.oninput = () => recalcEditTotals(editItemsBody);

        editItemsBody.innerHTML = '';
        const existingItems = inv.items || [];
        if (existingItems.length === 0) {
            addEditRow(editItemsBody);
        } else {
            existingItems.forEach(item => addEditRow(editItemsBody, item));
        }
        document.getElementById('editAddItemBtn').onclick = () => addEditRow(editItemsBody);

        document.getElementById('viewMode').style.display = 'none';
        document.getElementById('editMode').style.display = 'block';
        document.getElementById('viewActions').style.display = 'none';
        document.getElementById('editActions').style.display = 'block';
    }

    // modal button listeners
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn2').addEventListener('click', closeModal);
    document.getElementById('invoiceModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('invoiceModal')) closeModal();
    });
    document.getElementById('modalEditBtn').addEventListener('click', switchToEditMode);
    document.getElementById('modalCancelBtn').addEventListener('click', () => {
        document.getElementById('viewMode').style.display = 'block';
        document.getElementById('editMode').style.display = 'none';
        document.getElementById('viewActions').style.display = 'block';
        document.getElementById('editActions').style.display = 'none';
    });

    document.getElementById('modalExportBtn').addEventListener('click', () => {
        if (currentModalInvoice){
            console.log('Modal invoice items: ', currentModalInvoice.items);
            generateInvoicePDF(currentModalInvoice, currentUser);
        } 
    });

    //modal save button
    document.getElementById('modalSaveBtn').addEventListener('click', async () => {
        const id = currentModalInvoice.id;
        const updated = {
            client_name: document.getElementById('editClientName').value.trim(),
            client_email: document.getElementById('editClientEmail').value.trim(),
            client_address: document.getElementById('editClientAddress').value.trim(),
            due_date: document.getElementById('editDueDate').value || null,
            status: document.getElementById('editStatus').value,
            notes: document.getElementById('editNotes').value.trim(),
            // keep existing financial values unchanged
            description: currentModalInvoice.description,
            amount: parseFloat(document.getElementById('editSubtotal').textContent) || 0,
            vat_enabled: document.getElementById('editVatEnabled').checked,
            vat_amount: parseFloat(document.getElementById('editVat').textContent) || 0,
            total: parseFloat(document.getElementById('editTotal').textContent) || 0,
            invoice_number: document.getElementById('editInvoiceNumber').value.trim() || null,
            items: [...document.getElementById('editItemsBody').querySelectorAll('.invoice-item-row')].map(row => ({
                description: row.querySelector('[name="editItemDescription"]').value || '',
                quantity: row.querySelector('[name="editItemQuantity"]').value || '0',
                rate: row.querySelector('[name="editItemRate"]').value || '0.00',
                total: row.querySelector('[name="editItemTotal"]').value || '0.00'
            }))
        };

        try {
            console.log('PUT payload:', JSON.stringify(updated));
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updated)
            });
            const result = await res.json();
            if (res.ok) {
                alert('Invoice updated!');
                closeModal();
                loadInvoiceHistory();
            } else {
                alert(result.error || 'Failed to update invoice.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    });


    
});
