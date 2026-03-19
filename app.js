const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'pharmed-secret-key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.send("<script>alert('Unauthorized: Please log in first.'); window.location='/';</script>");
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/admin/dashboard')); 

app.use('/inventory',    isAuthenticated, require('./routes/admin/inventory'));
app.use('/supplier',     isAuthenticated, require('./routes/admin/supplier'));
app.use('/sales',        isAuthenticated, require('./routes/admin/sales'));
app.use('/client',       isAuthenticated, require('./routes/admin/clients'));
app.use('/pos',          isAuthenticated, require('./routes/admin/pos'));
app.use('/reports',      isAuthenticated, require('./routes/admin/reports'));
app.use('/bir',          isAuthenticated, require('./routes/admin/bir'));
app.use('/users',        isAuthenticated, require('./routes/admin/users'));
app.use('/announcement', isAuthenticated, require('./routes/admin/announcement'));
app.use('/chatbot',      isAuthenticated, require('./routes/admin/chatbot'));

app.use('/staff',            isAuthenticated, require('./routes/staff/dashboard'));
app.use('/staff/inventory',  isAuthenticated, require('./routes/staff/inventory'));
app.use('/staff/chatbot',    isAuthenticated, require('./routes/staff/queries'));
app.use('/staff/pos',        isAuthenticated, require('./routes/staff/pos'));
app.use('/staff/fulfillment',isAuthenticated, require('./routes/staff/fulfillment'));
app.use('/staff/waste',      isAuthenticated, require('./routes/staff/waste'));

app.use((req, res) => {
    res.status(404).render('pages/404', { title: '404 - Not Found', active: '' });
});

app.listen(PORT, () => {
    console.log(`PharMediSync Running at http://localhost:${PORT}`);
});