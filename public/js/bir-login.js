// public/js/bir-logic.js

function previewOR(orNumber) {
    // 1. Find the record from the global variable
    const record = window.allSalesData.find(r => r.orNo == orNumber);

    if (!record) {
        console.error("Record not found:", orNumber);
        return;
    }

    // 2. Fill the Thermal Modal using the keys from birRecords
    document.getElementById('or-num').innerText = record.orNo;
    document.getElementById('or-date').innerText = record.date + " " + (record.time || "");
    
    // Formatting numbers properly
    const vatable = Number(record.vatableSales || 0);
    const vatAmt  = Number(record.vatAmount || 0);
    const total   = Number(record.total || 0);

    document.getElementById('or-vat-sales').innerText = "₱" + vatable.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('or-vat-amt').innerText = "₱" + vatAmt.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('or-total').innerText = "₱" + total.toLocaleString(undefined, { minimumFractionDigits: 2 });

    // 3. Show the Modal
    const modal = document.getElementById('orModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
}

function closeOR() {
    document.getElementById('orModal').style.display = 'none';
    document.body.style.overflow = 'auto'; 
}

// Ensure the modal can close by clicking the dark background
window.onclick = function (event) {
    const modal = document.getElementById('orModal');
    if (event.target == modal) {
        closeOR();
    }
}

function filterLedger() {
    const q = document.getElementById('searchOR').value.toLowerCase();
    const rows = document.querySelectorAll('#birTable tbody tr');
    rows.forEach(row => {
        if (!row.classList.contains('bir-totals-row')) {
            row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
        }
    });
}