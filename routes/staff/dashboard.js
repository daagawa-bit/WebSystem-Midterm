const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

// Safe Read Helper
const readJSON = (filename) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

router.get('/', (req, res) => {
    try {
        const inventory = readJSON('inventory.json');
        const sales = readJSON('sales.json').salesOrders || [];
        const posSales = readJSON('pos_sales.json');
        const announcements = readJSON('announcements.json');

        // REAL-TIME CALCULATIONS
        const lowStockCount = inventory.filter(p => p.qty < 20).length;
        const pendingFulfillment = sales.filter(s => s.status === 'Active').length;
        const itemsHandledToday = posSales.filter(s => s.date === new Date().toLocaleDateString()).length;

        res.render('pages/staff/index', {
            title: 'Staff Terminal',
            active: 'dashboard',
            userRole: 'Staff',
            // Passing Real Data
            stats: {
                lowStock: lowStockCount,
                pendingOrders: pendingFulfillment,
                itemsHandled: itemsHandledToday,
                efficiency: "92%" 
            },
            inventory: inventory.filter(p => p.qty < 20).slice(0, 5),
            announcements: announcements.slice(0, 3),
            recentSales: posSales.slice(0, 4)
        });
    } catch (err) {
        res.status(500).send("Database error.");
    }
});

module.exports = router;