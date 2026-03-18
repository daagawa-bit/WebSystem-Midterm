const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const salesPath = path.join(__dirname, '../../data/pos_sales.json');

router.get('/', (req, res) => {
    const sales = fs.existsSync(salesPath) ? JSON.parse(fs.readFileSync(salesPath, 'utf8')) : [];

    // Calculate totals for the summary and the table footer
    const totals = {
        gross: sales.reduce((sum, s) => sum + s.total, 0),
        vat: sales.reduce((sum, s) => sum + s.vat, 0),
        vatable: sales.reduce((sum, s) => sum + s.subtotal, 0),
    };

    // Mapping POS data to BIR Record format
    const birRecords = sales.map(s => ({
        orNo: s.orNumber || s.id,
        date: s.date,
        time: s.time,
        customer: s.customer,
        grossSales: s.total,
        vatableSales: s.subtotal,
        vatAmount: s.vat,
        total: s.total,
        raw: s // keep original for JSON stringify
    }));

    res.render('pages/admin/bir', {
        title: 'BIR Compliance',
        active: 'bir',
        userRole: 'Admin',
        birRecords,
        totals
    });
});

module.exports = router;