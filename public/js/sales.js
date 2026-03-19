function inspectOrder(jsonStr) {
    const order = JSON.parse(jsonStr);
    
    // UI Update
    document.getElementById('audit-placeholder').style.display = 'none';
    document.getElementById('audit-ui').style.display = 'block';

    document.getElementById('view-id').innerText = order.id;
    document.getElementById('view-client').innerText = order.client;
    document.getElementById('view-batch').innerText = order.batchNo;
    document.getElementById('view-sub').innerText = "₱" + order.subtotal.toLocaleString();
    document.getElementById('view-vat').innerText = "₱" + order.vat.toLocaleString();
    document.getElementById('view-total').innerText = "₱" + order.total.toLocaleString();

    // Formal Invoice Preparation (Hidden)
    document.getElementById('pr-id').innerText = order.id;
    document.getElementById('pr-client').innerText = order.client;
    document.getElementById('pr-subtotal').innerText = "₱" + order.subtotal.toLocaleString();
    document.getElementById('pr-vat').innerText = "₱" + order.vat.toLocaleString();
    document.getElementById('pr-total').innerText = "₱" + order.total.toLocaleString();
    document.getElementById('pr-total-final').innerText = "₱" + order.total.toLocaleString();
}

function filterSales() {
    const q = document.getElementById('salesSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#salesTableBody tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
}