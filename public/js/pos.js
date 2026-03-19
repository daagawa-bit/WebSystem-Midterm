let cart = {};
let method = 'Cash';
let currentTotal = 0;

function addToCart(id, name, price, stock) {
    if (cart[id]) {
        if (cart[id].qty >= stock) return alert("No more stock available!");
        cart[id].qty++;
    } else {
        if (stock <= 0) return alert("Item out of stock!");
        cart[id] = { id, name, price: parseFloat(price), qty: 1 };
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
        container.innerHTML = '<div style="text-align:center; padding:100px 20px; color:#ccc; font-weight:bold; font-size:0.7rem; letter-spacing:1px;">READY FOR SCAN</div>';
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

    document.getElementById('txt-sub').innerText = '₱' + sub.toLocaleString(undefined, {minimumFractionDigits:2});
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
    document.getElementById('btn-cash').style.background = isCash ? 'var(--gray-800)' : 'white';
    document.getElementById('btn-cash').style.color = isCash ? 'white' : '#999';
    document.getElementById('btn-gcash').style.background = !isCash ? 'var(--gray-800)' : 'white';
    document.getElementById('btn-gcash').style.color = !isCash ? 'white' : '#999';
}

/** 
 * FORMAL PRINT LOGIC
 */
function printTransaction(tData) {
    const t = typeof tData === 'string' ? JSON.parse(tData) : tData;
    
    document.getElementById('print-or').innerText = t.orNumber;
    document.getElementById('print-date').innerText = t.date + ' ' + t.time;
    document.getElementById('print-sub').innerText = '₱' + t.subtotal.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('print-vat').innerText = '₱' + t.vat.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('print-total').innerText = '₱' + t.total.toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('print-method').innerText = t.method;
    document.getElementById('print-received').innerText = '₱' + Number(t.cashReceived).toLocaleString(undefined, {minimumFractionDigits:2});
    document.getElementById('print-change').innerText = '₱' + Number(t.change).toLocaleString(undefined, {minimumFractionDigits:2});

    // Handle items if available
    const itemContainer = document.getElementById('print-items');
    if (t.itemsList) {
        itemContainer.innerHTML = t.itemsList.map(i => `
            <tr><td style="padding:2px 0;">${i.name}</td><td>${i.qty}</td><td>₱${i.price.toLocaleString()}</td></tr>
        `).join('');
    } else {
        itemContainer.innerHTML = `<tr><td colspan="3">Consolidated Medical Supplies</td></tr>`;
    }

    window.print();
}

async function finalizeCheckout() {
    const items = Object.values(cart);
    if (items.length === 0) return alert("Cart is empty!");
    
    const cash = parseFloat(document.getElementById('cashInput').value) || 0;
    if (method === 'Cash' && cash < currentTotal) return alert("Insufficient Amount!");

    if (confirm(`Confirm ${method} transaction for ₱${currentTotal.toLocaleString()}?`)) {
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
            if(confirm("Transaction Successful! Print Official Receipt?")) {
                printTransaction(result.receipt);
                location.reload();
            } else {
                location.reload();
            }
        }
    }
}

function filterCatalog() {
    const q = document.getElementById('posSearch').value.toLowerCase();
    document.querySelectorAll('.product-tile').forEach(tile => {
        tile.style.display = tile.dataset.name.includes(q) ? 'block' : 'none';
    });
}

function resetBill() { 
    document.getElementById('txt-sub').innerText = '₱0.00'; 
    document.getElementById('txt-vat').innerText = '₱0.00'; 
    document.getElementById('txt-total').innerText = '₱0.00'; 
    document.getElementById('txt-change').innerText = '₱0.00'; 
}