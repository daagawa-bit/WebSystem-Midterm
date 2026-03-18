const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Correct paths to your data
const invPath = path.join(__dirname, '../../data/inventory.json');
const wastePath = path.join(__dirname, '../../data/waste_log.json');

// Helper to read JSON safely
const getSafeData = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim() === "") return [];
        return JSON.parse(content);
    } catch (err) {
        console.error("Error reading file:", filePath, err);
        return [];
    }
};

// GET - Display Waste Page
router.get('/', (req, res) => {
    const inventory = getSafeData(invPath);
    const wasteData = getSafeData(wastePath);

    res.render('pages/staff/waste', {
        title: 'Waste & Expiry Log',
        active: 'waste',
        userRole: 'Staff',
        inventory: inventory,
        logs: wasteData // CRITICAL: This must be named 'logs' to match your EJS
    });
});

// POST - Record Waste
router.post('/record', (req, res) => {
    const { productId, qty, reason } = req.body;
    let inventory = getSafeData(invPath);
    let logs = getSafeData(wastePath);

    const idx = inventory.findIndex(p => p.id === productId);
    if (idx !== -1) {
        // 1. Deduct from Inventory
        inventory[idx].qty -= parseInt(qty);
        if (inventory[idx].qty < 0) inventory[idx].qty = 0;
        
        // Update status if low
        if (inventory[idx].qty < 10) inventory[idx].status = "Low Stock";

        // 2. Create Log Entry
        const newLog = {
            id: "WST-" + Date.now().toString().slice(-4),
            productName: inventory[idx].name,
            qty: parseInt(qty),
            reason: reason,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        logs.unshift(newLog);

        // 3. Save Files
        fs.writeFileSync(invPath, JSON.stringify(inventory, null, 2));
        fs.writeFileSync(wastePath, JSON.stringify(logs, null, 2));
    }
    res.redirect('/staff/waste');
});

module.exports = router;