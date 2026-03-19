const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '../../data/sales.json');
const clientPath = path.join(__dirname, '../../data/clients.json');

const readJSON = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

router.get('/', (req, res) => {
    const salesData = readJSON(salesPath);
    const clientData = readJSON(clientPath);
    res.render('pages/admin/sales', {
        title: 'Sales Dashboard',
        active: 'sales',
        userRole: 'Admin',
        salesOrders: salesData.salesOrders,
        clients: clientData.clients,
        totalSales: salesData.salesOrders.reduce((s, o) => s + (o.total || 0), 0)
    });
});

// FIXED: Update Status route (Ship Now / Mark Delivered)
router.get('/update/:id/:field/:value', (req, res) => {
    let data = readJSON(salesPath);
    const index = data.salesOrders.findIndex(o => o.id === req.params.id);
    
    if (index !== -1) {
        data.salesOrders[index][req.params.field] = req.params.value;
        if (req.params.value === 'Delivered') {
            data.salesOrders[index].status = 'Completed';
        }
        fs.writeFileSync(salesPath, JSON.stringify(data, null, 2));
    }
    res.redirect('/sales');
});

router.post('/add', (req, res) => {
    let data = readJSON(salesPath);
    const total = parseFloat(req.body.total);
    const subtotal = total / 1.12;

    const newOrder = {
        id: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
        client: req.body.client,
        date: new Date().toISOString().split('T')[0],
        total: total,
        subtotal: parseFloat(subtotal.toFixed(2)),
        vat: parseFloat((total - subtotal).toFixed(2)),
        payment: req.body.payment,
        method: req.body.method,
        delivery: "Pending",
        status: "Active",
        batchNo: req.body.batchNo || "BN-TEMP"
    };

    data.salesOrders.unshift(newOrder);
    fs.writeFileSync(salesPath, JSON.stringify(data, null, 2));
    res.redirect('/sales');
});

module.exports = router;