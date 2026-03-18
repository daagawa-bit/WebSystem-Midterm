let cart = {};
let method = 'Cash';
let currentTotal = 0;

function addToCart(id, name, price, stock) {
    if (cart[id]) {
        if (cart[id].qty >= stock) return alert("No more stock available!");
        cart[id].qty++;
    } else {
        if (stock <= 0) return alert("Item out of stock!");
        cart[id] = { id, name, price, qty: 1 };
    }
    updateUI();
}

function updateQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    updateUI();
}

function updateUI() {
    const container = document.getElementById('cartItems');
    const items = Object.values(cart);
    document.getElementById('cartCount').innerText = `(${items.length})`;

    if (items.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:100px 20px; color:#ccc; font-weight:bold; font-size:0.7rem;">READY FOR SCAN</div>';
        resetBill();
        return;
    }

    container.innerHTML = items.map(i => `
        <div class="cart-item">
            <div style="flex:1">
                <strong style="font-size:0.75rem; color:#1F2937;">${i.name}</strong><br/>
                <small style="color:var(--red); font-weight:900;">₱${i.price.toLocaleString()}</small>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <button class="ci-remove" onclick="updateQty('${i.id}', -1)">-</button>
                <span style="font-weight:900; font-size:0.8rem; min-width:20px; text-align:center;">${i.qty}</span>
                <button class="ci-remove" onclick="updateQty('${i.id}', 1)">+</button>
            </div>
        </div>
    `).join('');

    const sub = items.reduce((s, i) => s + (i.price * i.qty), 0);
    const vat = sub * 0.12;
    currentTotal = sub + vat;

    document.getElementById('txt-sub').innerText = '₱' + sub.toLocaleString();
    document.getElementById('txt-vat').innerText = '₱' + vat.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('txt-total').innerText = '₱' + currentTotal.toLocaleString(undefined, {minimumFractionDigits:2});
    calcChange();
}

function calcChange() {
    const paid = parseFloat(document.getElementById('cashInput').value) || 0;
    const change = paid - currentTotal;
    document.getElementById('txt-change').innerText = '₱' + (change > 0 ? change.toLocaleString(undefined, {minimumFractionDigits:2}) : '0.00');
}

function setMethod(m) {
    method = m;
    const isCash = m === 'Cash';
    document.getElementById('btn-cash').style.cssText = isCash ? "flex:1; padding:8px; font-size:0.65rem; font-weight:900; border:1.5px solid var(--gray-800); background:var(--gray-800); color:white; border-radius:8px;" : "flex:1; padding:8px; font-size:0.65rem; font-weight:900; border:1.5px solid #eee; background:white; color:#999; border-radius:8px;";
    document.getElementById('btn-gcash').style.cssText = !isCash ? "flex:1; padding:8px; font-size:0.65rem; font-weight:900; border:1.5px solid var(--gray-800); background:var(--gray-800); color:white; border-radius:8px;" : "flex:1; padding:8px; font-size:0.65rem; font-weight:900; border:1.5px solid #eee; background:white; color:#999; border-radius:8px;";
}

async function finalizeCheckout() {
    const items = Object.values(cart);
    if (items.length === 0) return alert("Cart is empty!");
    
    const cash = parseFloat(document.getElementById('cashInput').value) || 0;
    if (method === 'Cash' && cash < currentTotal) return alert("Insufficient Amount!");

    if (confirm(`Finalize ${method} transaction for ₱${currentTotal.toLocaleString()}?`)) {
        const sub = items.reduce((s, i) => s + (i.price * i.qty), 0);
        const res = await fetch('/pos/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cart: items, method, subtotal: sub, vat: sub * 0.12, total: currentTotal, cashReceived: cash
            })
        });
        const result = await res.json();
        if (result.success) {
            alert("Transaction Complete! Official Receipt: " + result.or);
            location.reload();
        }
    }
}

function filterCatalog() {
    const q = document.getElementById('posSearch').value.toLowerCase();
    document.querySelectorAll('.product-tile').forEach(tile => {
        tile.style.display = tile.dataset.name.includes(q) ? 'block' : 'none';
    });
}

function resetBill() { document.getElementById('txt-sub').innerText = '₱0.00'; document.getElementById('txt-vat').innerText = '₱0.00'; document.getElementById('txt-total').innerText = '₱0.00'; document.getElementById('txt-change').innerText = '₱0.00'; }