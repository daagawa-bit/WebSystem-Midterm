const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '../../data/sales.json');
const clientPath = path.join(__dirname, '../../data/clients.json');

const readData = (p, key) => {
    if (!fs.existsSync(p)) return [];
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    return d[key] || [];
};

const saveData = (p, key, list) => {
    const data = {};
    data[key] = list;
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
    const salesOrders = readData(salesPath, 'salesOrders');
    const clients = readData(clientPath, 'clients');
    
    res.render('pages/admin/sales', {
        title: 'Sales Dashboard',
        active: 'sales',
        userRole: 'Admin',
        salesOrders: salesOrders,
        clients: clients,
        totalSales: salesOrders.reduce((s, o) => s + o.total, 0)
    });
});

// Added this to handle the form submission
router.post('/add', (req, res) => {
    let salesOrders = readData(salesPath, 'salesOrders');
    const total = parseFloat(req.body.total);
    const subtotal = total / 1.12;

    const newOrder = {
        id: `SO-${Date.now().toString().slice(-4)}`,
        client: req.body.client,
        date: new Date().toISOString().split('T')[0],
        total: total,
        subtotal: parseFloat(subtotal.toFixed(2)),
        vat: parseFloat((total - subtotal).toFixed(2)),
        payment: 'Unpaid',
        method: req.body.method || 'Cash',
        delivery: 'Pending',
        status: 'Active',
        batchNo: "BN-" + Math.floor(Math.random() * 9000 + 1000)
    };

    salesOrders.unshift(newOrder);
    saveData(salesPath, 'salesOrders', salesOrders);
    res.redirect('/sales');
});

// CRITICAL FIX: This must be at the bottom
module.exports = router;