function previewOR(orNumber) {
    // Correctly search the global array
    const record = window.allSalesData.find(r => r.orNo == orNumber);

    if (!record) {
        alert("Record not found!");
        return;
    }

    // Populate the Modal
    document.getElementById('or-num').innerText = record.orNo;
    document.getElementById('or-date').innerText = record.date + " " + (record.time || "");
    
    const fmt = (val) => "₱" + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById('or-vat-sales').innerText = fmt(record.vatableSales);
    document.getElementById('or-vat-amt').innerText = fmt(record.vatAmount);
    document.getElementById('or-total').innerText = fmt(record.total);

    // Show Modal
    document.getElementById('orModal').style.display = 'flex';
}

function closeOR() {
    document.getElementById('orModal').style.display = 'none';
}

// 1. SMART FEATURE: EXPORT THE OR AS PDF
function exportORPDF() {
    const element = document.getElementById('receipt-paper');
    const orNum = document.getElementById('or-num').innerText;
    
    // Hide buttons during export
    const buttons = element.querySelectorAll('button');
    buttons.forEach(b => b.style.visibility = 'hidden');

    const opt = {
        margin: 10,
        filename: `OR_${orNum}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        buttons.forEach(b => b.style.visibility = 'visible');
    });
}

// 2. SMART FEATURE: EXPORT FULL LEDGER AS PDF
function exportLedgerPDF() {
    const element = document.getElementById('ledger-content');
    const opt = {
        margin: 5,
        filename: 'PharMediSync_Tax_Ledger.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
}

// 3. WORKING SEARCH FUNCTION
function filterLedger() {
    const q = document.getElementById('searchOR').value.toLowerCase();
    const rows = document.querySelectorAll('#birTable tbody tr:not(.bir-totals-row)');
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

// Close modal if background clicked
window.onclick = function(event) {
    const modal = document.getElementById('orModal');
    if (event.target == modal) closeOR();
}