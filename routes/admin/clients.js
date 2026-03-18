const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../../data/clients.json');

const readClients = () => {
    try {
        if (!fs.existsSync(clientPath)) return { clients: [] };
        const data = JSON.parse(fs.readFileSync(clientPath, 'utf8'));
        return { clients: data.clients || [] };
    } catch (err) { return { clients: [] }; }
};

const saveClients = (data) => fs.writeFileSync(clientPath, JSON.stringify(data, null, 2));

// GET: View list
router.get('/', (req, res) => {
    const data = readClients();
    res.render('pages/admin/clients', {
        title: 'Client Management',
        active: 'clients',
        userRole: 'Admin',
        clients: data.clients
    });
});

// POST: Add
router.post('/add', (req, res) => {
    let data = readClients();
    const newClient = {
        id: `CL-${Date.now().toString().slice(-4)}`,
        facilityName: req.body.facilityName,
        email: req.body.email,
        contact: req.body.contact,
        username: req.body.username,
        password: req.body.password,
        status: 'Active'
    };
    data.clients.push(newClient);
    saveClients(data);
    res.redirect('/client'); // Redirect to the base path defined in app.js
});

// POST: Edit (The missing piece)
router.post('/edit/:id', (req, res) => {
    let data = readClients();
    const index = data.clients.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data.clients[index] = {
            ...data.clients[index],
            facilityName: req.body.facilityName,
            email: req.body.email,
            contact: req.body.contact,
            username: req.body.username,
            password: req.body.password
        };
        saveClients(data);
    }
    res.redirect('/client');
});

// GET: Delete
router.get('/delete/:id', (req, res) => {
    let data = readClients();
    data.clients = data.clients.filter(c => c.id !== req.params.id);
    saveClients(data);
    res.redirect('/client');
});

module.exports = router;