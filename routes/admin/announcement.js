const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/announcements.json');
const readData = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. READ
router.get('/', (req, res) => {
    const announcements = readData();
    res.render('pages/admin/announcement', {
        title: 'Announcements',
        active: 'announcement',
        userRole: 'Admin',
        announcements
    });
});

// 2. CREATE
router.post('/add', (req, res) => {
    const announcements = readData();
    const newAnn = {
        id: "ANN-" + Date.now().toString().slice(-4),
        title: req.body.title,
        body: req.body.body,
        date: new Date().toISOString().split('T')[0],
        audience: req.body.audience,
        priority: req.body.priority
    };
    announcements.unshift(newAnn); // Add to top
    fs.writeFileSync(dataPath, JSON.stringify(announcements, null, 2));
    res.redirect('/announcement');
});

// 3. UPDATE
router.post('/edit/:id', (req, res) => {
    let announcements = readData();
    const index = announcements.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        announcements[index] = {
            ...announcements[index],
            title: req.body.title,
            body: req.body.body,
            audience: req.body.audience,
            priority: req.body.priority
        };
        fs.writeFileSync(dataPath, JSON.stringify(announcements, null, 2));
    }
    res.redirect('/announcement');
});

// 4. DELETE
router.get('/delete/:id', (req, res) => {
    let announcements = readData();
    announcements = announcements.filter(a => a.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(announcements, null, 2));
    res.redirect('/announcement');
});

module.exports = router;