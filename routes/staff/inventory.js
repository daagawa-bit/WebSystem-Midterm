const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const invPath = path.join(__dirname, '../../data/inventory.json');

router.get('/', (req, res) => {
    try {
        const inventory = JSON.parse(fs.readFileSync(invPath, 'utf8'));
        const processedInv = inventory.map(item => {
            if (!item.expiry || item.expiry === "N/A") return { ...item, daysLeft: 9999 };
            
            const expiryDate = new Date(item.expiry);
            const today = new Date();
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return { ...item, daysLeft: diffDays };
        });

        res.render('pages/staff/inventory', {
            title: 'Stock Intelligence',
            active: 'inventory',
            userRole: 'Staff',
            inventory: processedInv
        });
    } catch (err) {
        res.status(500).send("Database Access Error.");
    }
});

module.exports = router;