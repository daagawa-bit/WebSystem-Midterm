const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const invPath = path.join(__dirname, '../../data/inventory.json');
const salesPath = path.join(__dirname, '../../data/pos_sales.json');

// GET - Staff POS Terminal
router.get('/', (req, res) => {
    const inventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));
    res.render('pages/staff/pos', {
        title: 'POS Terminal',
        active: 'pos',
        userRole: 'Staff',
        products: inventory
    });
});

// POST - Staff Checkout
router.post('/checkout', (req, res) => {
    const { cart, paymentMethod, amountPaid, changeDue, total } = req.body;
    let inventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));
    
    // 1. Deduct Stock
    cart.forEach(cartItem => {
        const idx = inventory.findIndex(p => p.id === cartItem.id);
        if (idx !== -1) {
            inventory[idx].qty -= cartItem.qty;
            if (inventory[idx].qty < 10) inventory[idx].status = "Low Stock";
            if (inventory[idx].qty <= 0) inventory[idx].status = "Out of Stock";
        }
    });

    fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));

    // 2. Save to Transaction Log
    let sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf8')) : [];
    sales.unshift({
        id: "OR-" + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        total: total,
        method: paymentMethod,
        paid: amountPaid,
        change: changeDue,
        items: cart.length
    });
    fs.writeFileSync(salesPath, JSON.stringify(sales, null, 2));

    res.json({ success: true });
});

module.exports = router;