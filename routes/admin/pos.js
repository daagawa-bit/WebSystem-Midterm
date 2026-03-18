const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const invPath = path.join(__dirname, '../../data/inventory.json');
const salesPath = path.join(__dirname, '../../data/pos_sales.json');

// Helper to read JSON safely
const readDB = (p) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];

router.get('/', (req, res) => {
    const inventory = readDB(invPath);
    const history = readDB(salesPath);
    res.render('pages/admin/pos', {
        title: 'Point of Sale',
        active: 'pos',
        userRole: 'Admin',
        products: inventory,
        transactions: history.slice(0, 5) // Show last 5 sales
    });
});

router.post('/checkout', (req, res) => {
    const { cart, method, subtotal, vat, total, cashReceived } = req.body;
    let inventory = readDB(invPath);
    let sales = readDB(salesPath);

    // 1. Deduct Inventory & Update Status
    cart.forEach(item => {
        const idx = inventory.findIndex(p => p.id === item.id);
        if (idx !== -1) {
            inventory[idx].qty -= item.qty;
            if (inventory[idx].qty <= 0) inventory[idx].status = "Out of Stock";
            else if (inventory[idx].qty < 10) inventory[idx].status = "Low Stock";
        }
    });

    // 2. Create Official Receipt (BIR Compliant Format)
    const newSale = {
        orNumber: "OR-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: cart.length,
        subtotal: subtotal,
        vat: vat,
        total: total,
        method: method,
        change: parseFloat(cashReceived) - total
    };

    sales.unshift(newSale); // Add to top of history

    // 3. Persist to Database
    fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));
    fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2));

    res.json({ success: true, or: newSale.orNumber });
});

module.exports = router;