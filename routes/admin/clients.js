const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../../data/clients.json');

const readClients = () => {
    try {
        if (!fs.existsSync(clientPath)) return { clients: [] };
        return JSON.parse(fs.readFileSync(clientPath, 'utf8'));
    } catch (err) { return { clients: [] }; }
};

const saveClients = (data) => fs.writeFileSync(clientPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
    const data = readClients();
    res.render('pages/admin/clients', {
        title: 'Institutional Portals',
        active: 'client',
        userRole: 'Admin',
        clients: data.clients
    });
});

router.post('/add', (req, res) => {
    let data = readClients();
    const newClient = {
        id: `CL-${Math.floor(1000 + Math.random() * 9000)}`,
        ...req.body,
        status: 'Active'
    };
    data.clients.push(newClient);
    saveClients(data);
    res.redirect('/client');
});

router.post('/edit/:id', (req, res) => {
    let data = readClients();
    const index = data.clients.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data.clients[index] = { id: req.params.id, ...req.body, status: data.clients[index].status };
        saveClients(data);
    }
    res.redirect('/client');
});

router.get('/delete/:id', (req, res) => {
    let data = readClients();
    data.clients = data.clients.filter(c => c.id !== req.params.id);
    saveClients(data);
    res.redirect('/client');
});

module.exports = router;