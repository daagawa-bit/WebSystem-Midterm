const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} to ${req.url}`);
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Internal Routes (Admin/Staff)
app.use('/', require('./routes/admin/dashboard'));
app.use('/chatbot', require('./routes/admin/chatbot'));

app.use('/supplier', require('./routes/admin/supplier'));
app.use('/inventory', require('./routes/admin/inventory'));
app.use('/sales', require('./routes/admin/sales'));
app.use('/client', require('./routes/admin/clients'));

app.use('/pos', require('./routes/admin/pos'));
app.use('/reports', require('./routes/admin/reports'));
app.use('/bir', require('./routes/admin/bir'));

app.use('/users', require('./routes/admin/users'));
app.use('/announcement', require('./routes/admin/announcement'));

app.use('/staff', require('./routes/staff/dashboard'));
app.use('/staff/pos', require('./routes/staff/pos'));

app.use('/staff/inventory', require('./routes/staff/inventory'));
app.use('/staff/fulfillment', require('./routes/staff/fulfillment'));
app.use('/staff/waste', require('./routes/staff/waste'));

app.use('/staff/chatbot', require('./routes/staff/queries'));

app.use((req, res) => {
    res.status(404).render('pages/404', { title: '404 - Not Found', active: '' });
});

app.listen(PORT, () => {
    console.log(`PharMediSync Running at http://localhost:${PORT}`);
});