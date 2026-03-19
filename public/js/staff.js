let cart = [];
let selectedMethod = 'Cash';
let grandTotalValue = 0;

function addToCart(id, name, price, stock) {
    const item = cart.find(i => i.id === id);
    if (item) {
        if (item.qty < stock) {
            item.qty++;
        } else {
            alert("⚠️ Stock Limit!");
        }
    } else {
        if (stock <= 0) return alert("❌ Out of stock!");
        cart.push({ id, name, price: parseFloat(price), qty: 1, stock: stock });
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('staffCartItems');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; margin-top:50px; opacity:0.2;"><p style="font-size:0.6rem; font-weight:900;">TERMINAL READY</p></div>`;
        updateBilling(0);
        return;
    }

    container.innerHTML = cart.map(i => `
        <div class="cart-item-row shadow-sm">
            <div style="flex:1">
                <strong style="font-size:0.7rem; color:#1e293b;">${i.name}</strong>
                <div style="font-size:8px; color:#94a3b8; font-weight:700;">Qty: ${i.qty} x ₱${i.price.toLocaleString()}</div>
            </div>
            <span style="font-size:0.75rem; font-weight:900; color:var(--red);">₱${(i.qty * i.price).toLocaleString()}</span>
        </div>
    `).join('');

    const subtotal = cart.reduce((s, i) => s + (i.qty * i.price), 0);
    updateBilling(subtotal);
}

function updateBilling(subtotal) {
    const vat = subtotal * 0.12;
    grandTotalValue = subtotal + vat;

    document.getElementById('subtotalDisplay').innerText = '₱' + subtotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('vatDisplay').innerText = '₱' + vat.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('totalDisplay').innerText = '₱' + grandTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2});
    calcChange();
}

function setPaymentMethod(m) {
    selectedMethod = m;
    const isCash = m === 'Cash';
    
    // UI Update
    document.getElementById('m-cash').style.cssText = isCash ? "flex:1; padding: 8px; font-size: 10px; font-weight: 900; border: 1.5px solid var(--gray-800); background: var(--gray-800); color: white; border-radius: 8px; cursor: pointer;" : "flex:1; padding: 8px; font-size: 10px; font-weight: 900; border: 1.5px solid #eee; background: white; color: #999; border-radius: 8px; cursor: pointer;";
    document.getElementById('m-gcash').style.cssText = !isCash ? "flex:1; padding: 8px; font-size: 10px; font-weight: 900; border: 1.5px solid var(--gray-800); background: var(--gray-800); color: white; border-radius: 8px; cursor: pointer;" : "flex:1; padding: 8px; font-size: 10px; font-weight: 900; border: 1.5px solid #eee; background: white; color: #999; border-radius: 8px; cursor: pointer;";
    
    // If GCash, auto-fill the cash input with exact total
    if(!isCash) {
        document.getElementById('amtPaid').value = grandTotalValue.toFixed(2);
        calcChange();
    }
}

function calcChange() {
    const paid = parseFloat(document.getElementById('amtPaid').value) || 0;
    const change = paid - grandTotalValue;
    document.getElementById('changeDisplay').innerText = '₱' + (change > 0 ? change.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00');
}

async function staffCheckout() {
    if (cart.length === 0) return alert("Cart is empty.");
    const paid = parseFloat(document.getElementById('amtPaid').value) || 0;
    
    if (selectedMethod === 'Cash' && paid < grandTotalValue) return alert("Insufficient Cash Received!");

    if (confirm(`Finalize ${selectedMethod} transaction?`)) {
        const response = await fetch('/staff/pos/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cart: cart, 
                paymentMethod: selectedMethod,
                amountPaid: paid,
                changeDue: paid - grandTotalValue,
                total: grandTotalValue
            })
        });

        if ((await response.json()).success) {
            alert("✅ Success! Transaction Logged.");
            resetTerminal();
            location.reload();
        }
    }
}

function filterPos() {
    const q = document.getElementById('posSearch').value.toLowerCase();
    document.querySelectorAll('.staff-p-card').forEach(c => {
        c.style.display = c.dataset.name.includes(q) ? 'block' : 'none';
    });
}

function resetTerminal() {
    cart = [];
    document.getElementById('amtPaid').value = '';
    renderCart();
}

function selectForWaste(id, name, currentStock) {
    document.getElementById('input-id').value = id;
    document.getElementById('display-name').innerText = name;
    
    const qtyInput = document.getElementById('input-qty');
    qtyInput.max = currentStock;
    qtyInput.value = 1; 
    qtyInput.placeholder = "Max: " + currentStock;
    
    const formCard = document.getElementById('waste-form-card');
    formCard.style.borderColor = "var(--red)";
    setTimeout(() => formCard.style.borderColor = "#e2e8f0", 1000);
}

function filterWasteTable() {
    const q = document.getElementById('wasteSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#wasteTable tbody tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
    });
}

function validatePicking(orderId) {
    const card = document.getElementById(`order-card-${orderId}`);
    const checks = card.querySelectorAll('.picking-check');
    const btn = card.querySelector('.btn-fulfillment');
    
    const checkedCount = Array.from(checks).filter(c => c.checked).length;
    
    if(checkedCount === checks.length) {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.innerText = "Confirm Packing Complete";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.innerText = `Check Items (${checkedCount}/${checks.length})`;
    }
}