const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const supPath = path.join(__dirname, '../../data/suppliers.json');
const poPath = path.join(__dirname, '../../data/purchaseOrders.json');

const readData = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// 1. READ Suppliers & POs
router.get('/', (req, res) => {
    const suppliers = readData(supPath);
    const purchaseOrders = readData(poPath);
    res.render('pages/admin/supplier', {
        title: 'Supplier Management',
        active: 'supplier',
        userRole: 'Admin',
        suppliers,
        purchaseOrders
    });
});

// 2. CREATE Supplier
router.post('/add', (req, res) => {
    const suppliers = readData(supPath);
    const newSup = {
        ...req.body,
        id: "SUP-" + Math.floor(1000 + Math.random() * 9000),
        ...req.body,
        rating: 5.0,
        status: "Active"
    };
    suppliers.push(newSup);
    fs.writeFileSync(supPath, JSON.stringify(suppliers, null, 2));
    res.redirect('/supplier');
});

// 3. UPDATE Supplier (Edit)
router.post('/edit/:id', (req, res) => {
    let suppliers = readData(supPath);
    const index = suppliers.findIndex(s => s.id === req.params.id);

    if (index !== -1) {
        // We update the specific supplier at this index
        suppliers[index] = { 
            id: req.params.id,               // Keep original ID
            name: req.body.name,             // From form
            email: req.body.email,           // From form
            password: req.body.password,     // From form
            leadTime: req.body.leadTime,     // From form
            phone: req.body.phone,           // From form
            address: req.body.address,       // From form
            suppliedProducts: req.body.suppliedProducts, // THE NEW FEATURE
            rating: suppliers[index].rating, // Preserved (Not from form)
            status: suppliers[index].status  // Preserved (Not from form)
        };

        fs.writeFileSync(supPath, JSON.stringify(suppliers, null, 2));
    }
    res.redirect('/supplier');
});

// 4. DELETE Supplier (The 404 fix)
router.get('/delete/:id', (req, res) => {
    let suppliers = readData(supPath);
    suppliers = suppliers.filter(s => s.id !== req.params.id);
    fs.writeFileSync(supPath, JSON.stringify(suppliers, null, 2));
    res.redirect('/supplier');
});

// 5. CREATE Purchase Order
router.post('/po/add', (req, res) => {
    const pos = readData(poPath);
    
    const qty = parseInt(req.body.items);
    const unitPrice = parseFloat(req.body.unitPrice);
    const total = qty * unitPrice; // Logic calculation on server side

    const newPO = {
        id: "PO-" + Math.floor(1000 + Math.random() * 9000),
        supplier: req.body.supplier,
        product: req.body.product,
        date: new Date().toISOString().split('T')[0],
        qty: qty,
        unitPrice: unitPrice,
        total: total, // Final cost for the budget
        status: "Pending"
    };

    pos.push(newPO);
    fs.writeFileSync(poPath, JSON.stringify(pos, null, 2));
    res.redirect('/supplier');
});

// 6. UPDATE PO Status
router.get('/po/status/:id/:status', (req, res) => {
    let pos = readData(poPath);
    const index = pos.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        pos[index].status = req.params.status;
        fs.writeFileSync(poPath, JSON.stringify(pos, null, 2));
    }
    res.redirect('/supplier');
});

module.exports = router;