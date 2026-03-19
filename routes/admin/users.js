const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '../../data/admins.json');
const staffPath = path.join(__dirname, '../../data/staff_members.json');

// Helper to read JSON safely
const getData = (p) => fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : [];

// 1. READ - Combines both files for the table
router.get('/', (req, res) => {
    const admins = getData(adminPath);
    const staff = getData(staffPath);
    
    res.render('pages/admin/users', {
        title: 'Staff Management',
        active: 'manage-staff',
        userRole: 'Admin',
        users: [...admins, ...staff] 
    });
});

// 2. CREATE - Saves to the correct file based on role
router.post('/add', (req, res) => {
    const role = req.body.role;
    const targetPath = (role === 'Admin') ? adminPath : staffPath;
    let users = getData(targetPath);

    const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: role,
        status: "Active",
        lastLogin: "Never"
    };

    users.push(newUser);
    fs.writeFileSync(targetPath, JSON.stringify(users, null, 2));
    res.redirect('/users');
});

// 3. UPDATE - Handles editing and potential role-switching
router.post('/edit/:email', (req, res) => {
    let admins = getData(adminPath);
    let staff = getData(staffPath);
    const email = req.params.email;

    admins = admins.filter(u => u.email !== email);
    staff = staff.filter(u => u.email !== email);

    // Create updated user object
    const updatedUser = {
        name: req.body.name,
        email: email, 
        password: req.body.password,
        role: req.body.role,
        status: "Active",
        lastLogin: "Updated"
    };

    // Save to the NEWLY selected role file
    if (req.body.role === 'Admin') {
        admins.push(updatedUser);
    } else {
        staff.push(updatedUser);
    }

    fs.writeFileSync(adminPath, JSON.stringify(admins, null, 2));
    fs.writeFileSync(staffPath, JSON.stringify(staff, null, 2));
    res.redirect('/users');
});

// 4. DELETE - Checks both files
router.get('/delete/:email', (req, res) => {
    let admins = getData(adminPath).filter(u => u.email !== req.params.email);
    let staff = getData(staffPath).filter(u => u.email !== req.params.email);

    fs.writeFileSync(adminPath, JSON.stringify(admins, null, 2));
    fs.writeFileSync(staffPath, JSON.stringify(staff, null, 2));
    res.redirect('/users');
});

module.exports = router;