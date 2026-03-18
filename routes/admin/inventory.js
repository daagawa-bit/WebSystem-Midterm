const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/inventory.json');
const getInventory = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. READ (The table)
router.get('/', (req, res) => {
    res.render('pages/admin/inventory', {
        title: 'Inventory', active: 'inventory', userRole: 'Admin',
        inventory: getInventory()
    });
});

// 2. CREATE (Add)
router.post('/add', (req, res) => {
    const inventory = getInventory();
    const newProd = {
        id: "SKU-" + Date.now().toString().slice(-4),
        name: req.body.name,
        category: req.body.category,
        batch: req.body.batch,
        qty: parseInt(req.body.qty),
        // ADD THIS LINE:
        price: parseFloat(req.body.price) || 0, 
        unit: req.body.unit,
        expiry: req.body.expiry,
        status: parseInt(req.body.qty) < 20 ? "Low Stock" : "Good"
    };
    inventory.push(newProd);
    fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    res.redirect('/inventory');
});

// 3. UPDATE (Edit - POST)
// Path: /inventory/edit/:id
router.post('/edit/:id', (req, res) => {
    const inventory = getInventory();
    const index = inventory.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
        inventory[index] = {
            id: req.params.id, // Keep the same ID
            name: req.body.name,
            category: req.body.category,
            batch: req.body.batch,
            qty: parseInt(req.body.qty),
            unit: req.body.unit,
            expiry: req.body.expiry,
            status: parseInt(req.body.qty) < 20 ? "Low Stock" : "Good"
        };
        fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    }
    res.redirect('/inventory');
});

// 4. DELETE (GET)
// Path: /inventory/delete/:id
router.get('/delete/:id', (req, res) => {
    let inventory = getInventory();
    inventory = inventory.filter(i => i.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    res.redirect('/inventory');
});

module.exports = router;