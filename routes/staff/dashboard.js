const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    // Make sure path is pages/staff/index
    res.render('pages/staff/index', {
        title: 'Staff Terminal',
        active: 'dashboard',
        userRole: 'Staff',
        // Provide empty arrays if data isn't ready so it doesn't crash
        tasks: [],
        lowStock: [],
        announcements: []
    });
});

module.exports = router;