const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const readDB = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/', file), 'utf8'));

router.get('/', (req, res) => {
    const inventory = readDB('inventory.json');
    const sales = readDB('pos_sales.json');
    const suppliers = readDB('suppliers.json');

    // 1. BIR TAX CALCULATIONS
    const totalGross = sales.reduce((sum, s) => sum + s.total, 0);
    const totalVAT = sales.reduce((sum, s) => sum + s.vat, 0);
    const netSales = totalGross - totalVAT;

    // 2. PREDICTIVE ANALYTICS (Forecasting)
    const criticalStock = inventory.filter(p => p.qty < 10);
    const reorderRecommendations = criticalStock.map(p => ({
        name: p.name,
        suggested: 50 - p.qty, // Predicts need to reach par level of 50
        urgency: p.qty < 5 ? 'High' : 'Medium'
    }));

    // 3. EXPIRY WASTE REPORT
    const expiredValue = inventory
        .filter(p => p.status === 'Near Expiry')
        .reduce((sum, p) => sum + (p.price * p.qty), 0);

    res.render('pages/admin/reports', {
        title: 'Business Intelligence',
        active: 'reports',
        userRole: 'Admin',
        metrics: {
            gross: totalGross,
            vat: totalVAT,
            net: netSales,
            waste: expiredValue,
            salesCount: sales.length
        },
        forecast: reorderRecommendations,
        inventory: inventory,
        suppliers: suppliers
    });
});

module.exports = router;