const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '../../data/sales.json');

router.get('/', (req, res) => {
    const data = JSON.parse(fs.readFileSync(salesPath, 'utf8'));
    // Only show orders that are 'Active' (Preparing or Ready)
    const pendingOrders = data.salesOrders.filter(o => o.status !== 'Completed');

    res.render('pages/staff/fulfillment', {
        title: 'Order Fulfillment',
        active: 'fulfillment',
        userRole: 'Staff',
        orders: pendingOrders
    });
});

module.exports = router;