const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '../../data/sales.json');

const readSales = () => {
    const data = JSON.parse(fs.readFileSync(salesPath, 'utf8'));
    return data.salesOrders || [];
};

router.get('/', (req, res) => {
    const orders = readSales();
    const pendingOrders = orders.filter(o => o.status === 'Active' && o.delivery !== 'Delivered');

    res.render('pages/staff/fulfillment', {
        title: 'Order Fulfillment',
        active: 'fulfillment',
        userRole: 'Staff',
        orders: pendingOrders
    });
});

router.post('/update-status/:id', (req, res) => {
    let data = JSON.parse(fs.readFileSync(salesPath, 'utf8'));
    const index = data.salesOrders.findIndex(o => o.id === req.params.id);
    
    if (index !== -1) {
        const current = data.salesOrders[index].delivery;
        if (current === 'Pending') {
            data.salesOrders[index].delivery = 'Packed';
        } else {
            data.salesOrders[index].delivery = 'In Transit';
        }
        
        fs.writeFileSync(salesPath, JSON.stringify(data, null, 2));
    }
    res.redirect('/staff/fulfillment');
});

module.exports = router;