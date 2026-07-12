document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    let currentUser = {};

    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            currentUser = await res.json();
        }
    } catch (err) {
        console.error('Could not load user:', err);
    }

    const formIds = [
        'contractTitle',
        'contractStartDate',
        'contractEndDate',
        'artistName',
        'artistEmail',
        'clientName',
        'clientEmail',
        'clientAddress',
        'projectFee',
        'depositAmount',
        'paymentTerms',
        'revisionCount',
        'scopeOfWork',
        'deliverables',
        'usageRights',
        'cancellationTerms',
        'confidentialityTerms',
        'additionalTerms',
        'contractStatus',
        'contractNotes'
    ];

    const fields = Object.fromEntries(
        formIds.map(id => [id, document.getElementById(id)])
    );

    const previewTemplate = document.getElementById('previewTemplate');
    const previewArtistName = document.getElementById('previewArtistName');
    const previewClientName = document.getElementById('previewClientName');
    const previewProjectTitle = document.getElementById('previewProjectTitle');
    const previewProjectFee = document.getElementById('previewProjectFee');
    const previewDates = document.getElementById('previewDates');
    const previewScope = document.getElementById('previewScope');
    const previewUsage = document.getElementById('previewUsage');
    const previewCancellation = document.getElementById('previewCancellation');

    const templateButtons = document.querySelectorAll('.contract-template-btn');
    const resetBtn = document.getElementById('resetContractBtn');
    const exportBtn = document.getElementById('exportContractPdfBtn');

    let selectedTemplate = 'commission';

    const templateContent = {
        commission: {
            label: 'Commission',
            paymentTerms: '50% upfront, 50% on completion',
            revisionCount: '2 rounds',
            scopeOfWork: 'The Artist agrees to create original commissioned artwork for the Client based on the agreed brief, format, and timeline.',
            deliverables: 'Final high-resolution artwork files will be delivered in the agreed format upon receipt of final payment.',
            usageRights: 'The Client receives agreed usage rights for the commissioned work. Copyright remains with the Artist unless otherwise agreed in writing.',
            cancellationTerms: 'If the Client cancels after work has started, the deposit is non-refundable and additional completed work may be billed proportionally.',
            confidentialityTerms: 'Both parties agree to keep confidential any private project information, drafts, and business details unless disclosure is required by law.',
            additionalTerms: 'Any changes outside the agreed scope may require a revised quote and updated timeline.'
        },
        commercial: {
            label: 'Commercial / Company',
            paymentTerms: '50% upfront, 50% within 14 days of final delivery',
            revisionCount: '2 rounds',
            scopeOfWork: 'The Artist agrees to produce creative work for commercial use in line with the approved brief provided by the Client.',
            deliverables: 'Deliverables include final approved assets in the formats specified in the project brief.',
            usageRights: 'The Client is granted a non-exclusive licence for the agreed commercial use only. Any extended, exclusive, or resale rights must be agreed separately in writing.',
            cancellationTerms: 'If the project is cancelled after commencement, the deposit remains non-refundable and the Artist reserves the right to invoice for work completed to date.',
            confidentialityTerms: 'The Artist agrees not to disclose confidential commercial information, campaign details, or internal documents shared during the project.',
            additionalTerms: 'Credit, portfolio display rights, and any exclusivity terms should be confirmed in writing before project completion.'
        },
        ongoing: {
            label: 'Ongoing Project',
            paymentTerms: 'Monthly invoicing or staged payments as agreed in writing',
            revisionCount: 'Reasonable revisions within each agreed phase',
            scopeOfWork: 'The Artist agrees to provide ongoing creative services for the duration of the project as set out in the agreed schedule or statement of work.',
            deliverables: 'Deliverables will be produced on a rolling basis according to agreed milestones, deadlines, or monthly outputs.',
            usageRights: 'Usage rights apply only to paid-for deliverables and only for the purposes agreed between both parties.',
            cancellationTerms: 'Either party may terminate the agreement with reasonable written notice. Work completed up to the termination date remains payable.',
            confidentialityTerms: 'Both parties agree to keep project materials, communications, and business-sensitive information confidential.',
            additionalTerms: 'Project scope, timelines, and fees may be reviewed periodically by mutual agreement.'
        }
    };

    function formatCurrency(value) {
        const number = parseFloat(value);
        return Number.isFinite(number) ? number.toFixed(2) : '0.00';
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-IE', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function updatePreview() {
        if (previewTemplate) {
            previewTemplate.textContent = templateContent[selectedTemplate].label;
        }

        if (previewArtistName) {
            previewArtistName.textContent = fields.artistName?.value.trim() || '-';
        }

        if (previewClientName) {
            previewClientName.textContent = fields.clientName?.value.trim() || '-';
        }

        if (previewProjectTitle) {
            previewProjectTitle.textContent = fields.contractTitle?.value.trim() || '-';
        }

        if (previewProjectFee) {
            previewProjectFee.textContent = formatCurrency(fields.projectFee?.value);
        }

        if (previewDates) {
            const start = formatDate(fields.contractStartDate?.value);
            const end = formatDate(fields.contractEndDate?.value);

            if (start && end) {
                previewDates.textContent = `${start} to ${end}`;
            } else if (start) {
                previewDates.textContent = `Starts ${start}`;
            } else if (end) {
                previewDates.textContent = `Due ${end}`;
            } else {
                previewDates.textContent = '-';
            }
        }

        if (previewScope) {
            previewScope.textContent = fields.scopeOfWork?.value.trim() || 'No contract text yet.';
        }

        if (previewUsage) {
            previewUsage.textContent = fields.usageRights?.value.trim() || 'No contract text yet.';
        }

        if (previewCancellation) {
            previewCancellation.textContent = fields.cancellationTerms?.value.trim() || 'No contract text yet.';
        }
    }

    function applyTemplate(templateKey) {
        const template = templateContent[templateKey];
        if (!template) return;

        selectedTemplate = templateKey;

        fields.paymentTerms.value = template.paymentTerms;
        fields.revisionCount.value = template.revisionCount;
        fields.scopeOfWork.value = template.scopeOfWork;
        fields.deliverables.value = template.deliverables;
        fields.usageRights.value = template.usageRights;
        fields.cancellationTerms.value = template.cancellationTerms;
        fields.confidentialityTerms.value = template.confidentialityTerms;
        fields.additionalTerms.value = template.additionalTerms;

        templateButtons.forEach(btn => {
            const isActive = btn.dataset.template === templateKey;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });

        updatePreview();
    }

    function resetForm() {
        Object.values(fields).forEach(field => {
            if (!field) return;

            if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            } else {
                field.value = '';
            }
        });

        if (fields.contractStatus) {
            fields.contractStatus.value = 'draft';
        }

        selectedTemplate = 'commission';
        applyTemplate(selectedTemplate);

        if (fields.contractTitle) fields.contractTitle.value = '';
        if (fields.contractStartDate) fields.contractStartDate.value = '';
        if (fields.contractEndDate) fields.contractEndDate.value = '';
        if (fields.artistName) fields.artistName.value = currentUser.name || '';
        if (fields.artistEmail) fields.artistEmail.value = currentUser.email || '';
        if (fields.clientName) fields.clientName.value = '';
        if (fields.clientEmail) fields.clientEmail.value = '';
        if (fields.clientAddress) fields.clientAddress.value = '';
        if (fields.projectFee) fields.projectFee.value = '';
        if (fields.depositAmount) fields.depositAmount.value = '';
        if (fields.contractNotes) fields.contractNotes.value = '';

        updatePreview();
    }

    function getContractData() {
        return {
            template: templateContent[selectedTemplate].label,
            contractTitle: fields.contractTitle?.value.trim() || '',
            contractStartDate: fields.contractStartDate?.value || '',
            contractEndDate: fields.contractEndDate?.value || '',
            artistName: fields.artistName?.value.trim() || '',
            artistEmail: fields.artistEmail?.value.trim() || '',
            clientName: fields.clientName?.value.trim() || '',
            clientEmail: fields.clientEmail?.value.trim() || '',
            clientAddress: fields.clientAddress?.value.trim() || '',
            projectFee: formatCurrency(fields.projectFee?.value),
            depositAmount: formatCurrency(fields.depositAmount?.value),
            paymentTerms: fields.paymentTerms?.value.trim() || '',
            revisionCount: fields.revisionCount?.value.trim() || '',
            scopeOfWork: fields.scopeOfWork?.value.trim() || '',
            deliverables: fields.deliverables?.value.trim() || '',
            usageRights: fields.usageRights?.value.trim() || '',
            cancellationTerms: fields.cancellationTerms?.value.trim() || '',
            confidentialityTerms: fields.confidentialityTerms?.value.trim() || '',
            additionalTerms: fields.additionalTerms?.value.trim() || '',
            contractStatus: fields.contractStatus?.value || 'draft',
            contractNotes: fields.contractNotes?.value.trim() || ''
        };
    }

    function exportContractPDF(contract, user) {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('jsPDF is not loaded. Please add the jsPDF CDN script before contracts.js.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        let y = 20;

        function addSection(title, body) {
            const safeBody = body && body.trim() ? body.trim() : 'Not provided.';
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, margin, y);
            y += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(safeBody, maxWidth);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 6;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Fiadh Contract Draft', margin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Template: ${contract.template}`, margin, y);
        y += 6;
        doc.text(`Project: ${contract.contractTitle || 'Untitled project'}`, margin, y);
        y += 6;
        doc.text(`Artist: ${contract.artistName || user.name || '-'}`, margin, y);
        y += 6;
        doc.text(`Client: ${contract.clientName || '-'}`, margin, y);
        y += 6;
        doc.text(`Fee: EUR ${contract.projectFee}`, margin, y);
        y += 6;
        doc.text(`Deposit: EUR ${contract.depositAmount}`, margin, y);
        y += 6;
        doc.text(`Status: ${contract.contractStatus}`, margin, y);
        y += 10;

        const start = formatDate(contract.contractStartDate);
        const end = formatDate(contract.contractEndDate);
        const dateLine = start && end ? `${start} to ${end}` : start || end || 'Not provided';
        doc.text(`Dates: ${dateLine}`, margin, y);
        y += 10;

        addSection('Parties', `Artist: ${contract.artistName || '-'}\nArtist email: ${contract.artistEmail || '-'}\nClient: ${contract.clientName || '-'}\nClient email: ${contract.clientEmail || '-'}\nClient address: ${contract.clientAddress || '-'}`);
        addSection('Scope of work', contract.scopeOfWork);
        addSection('Deliverables', contract.deliverables);
        addSection('Payment terms', `Total fee: EUR ${contract.projectFee}\nDeposit: EUR ${contract.depositAmount}\nTerms: ${contract.paymentTerms || 'Not provided.'}`);
        addSection('Revisions', contract.revisionCount);
        addSection('Usage rights / licence', contract.usageRights);
        addSection('Cancellation terms', contract.cancellationTerms);
        addSection('Confidentiality', contract.confidentialityTerms);
        addSection('Additional terms', contract.additionalTerms);
        addSection('Internal notes', contract.contractNotes);

        const filenameBase = (contract.contractTitle || 'contract-draft')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        doc.save(`${filenameBase || 'contract-draft'}.pdf`);
    }

    templateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyTemplate(btn.dataset.template);
        });
    });

    Object.values(fields).forEach(field => {
        if (!field) return;
        field.addEventListener('input', updatePreview);
        field.addEventListener('change', updatePreview);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const contract = getContractData();

            if (!contract.artistName) {
                alert('Please enter the artist name.');
                return;
            }

            if (!contract.clientName) {
                alert('Please enter the client name.');
                return;
            }

            if (!contract.contractTitle) {
                alert('Please enter the project title.');
                return;
            }

            exportContractPDF(contract, currentUser);
        });
    }

    if (fields.artistName && currentUser.name) {
        fields.artistName.value = currentUser.name;
    }

    if (fields.artistEmail && currentUser.email) {
        fields.artistEmail.value = currentUser.email;
    }

    applyTemplate(selectedTemplate);
    updatePreview();
});