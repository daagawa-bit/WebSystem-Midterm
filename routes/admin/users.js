const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../../data/users.json');

// Helper to read JSON
const readUsers = () => {
    if (!fs.existsSync(usersPath)) return [];
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
};

// 1. READ - List all users
router.get('/', (req, res) => {
    const users = readUsers(); // Reads your users.json
    res.render('pages/admin/users', {
        title: 'Staff Management',
        active: 'manage-staff',
        userRole: 'Admin',
        users: users
    });
});

// 2. CREATE - Add new staff
router.post('/add', (req, res) => {
    const users = readUsers();
    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        status: "Active",
        lastLogin: "Never"
    };
    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.redirect('/users');
});

// 3. UPDATE - Edit existing staff
router.post('/edit/:email', (req, res) => {
    let users = readUsers();
    const index = users.findIndex(u => u.email === req.params.email);
    if (index !== -1) {
        users[index] = {
            ...users[index],
            name: req.body.name,
            password: req.body.password,
            role: req.body.role
            // Email is the ID, so we don't change it
        };
        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    }
    res.redirect('/users');
});

// 4. DELETE - Remove staff
router.get('/delete/:email', (req, res) => {
    let users = readUsers();
    users = users.filter(u => u.email !== req.params.email);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.redirect('/users');
});

module.exports = router;