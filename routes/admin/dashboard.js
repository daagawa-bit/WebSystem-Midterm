const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Paths to the data files
const dataDir = path.join(__dirname, '../../data');
const paths = {
    inventory: path.join(dataDir, 'inventory.json'),
    clients: path.join(dataDir, 'clients.json'),
    suppliers: path.join(dataDir, 'suppliers.json'),
    sales: path.join(dataDir, 'sales.json'),
    pos: path.join(dataDir, 'pos_sales.json'),
    admins: path.join(dataDir, 'admins.json'),        
    staff: path.join(dataDir, 'staff_members.json')   
};

const getSafeData = (filePath, key) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim() === "") return [];
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed;
        return parsed[key] || [];
    } catch (err) { return []; }
};

router.get('/', (req, res) => {
    res.render('pages/admin/login', { title: 'Admin & Staff Login', active: 'login' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const inputEmail = email.toLowerCase().trim();
    const inputPass = password.toString().trim();

    try {
        const admins = getSafeData(paths.admins, 'admins');
        const adminUser = admins.find(u => u.email.toLowerCase().trim() === inputEmail && u.password === inputPass);

        if (adminUser) {
            req.session.user = adminUser; 
            return res.redirect('/dashboard');
        }

        const staffMembers = getSafeData(paths.staff, 'staff');
        const staffUser = staffMembers.find(u => u.email.toLowerCase().trim() === inputEmail && u.password === inputPass);

        if (staffUser) {
            req.session.user = staffUser;
            return res.redirect('/staff');
        }

        res.send("<script>alert('Invalid Credentials'); window.location='/';</script>");
    } catch (err) { res.status(500).send("Login Error."); }
});


router.get('/dashboard', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') {
        return res.redirect('/');
    }
    try {
        const inventory = getSafeData(paths.inventory, 'products');
        const clients = getSafeData(paths.clients, 'clients');
        const salesOrders = getSafeData(paths.sales, 'salesOrders');
        const posTransactions = getSafeData(paths.pos, 'posTransactions');
        const staff = getSafeData(paths.staff, 'staff');
        const admins = getSafeData(paths.admins, 'admins');

        const totalQty = inventory.reduce((sum, p) => sum + (p.qty || 0), 0);
        const posRevenue = posTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
        const instRevenue = salesOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const totalRev = posRevenue + instRevenue;

        const liveData = {
            kpi: {
                salesPending: salesOrders.filter(s => s.status === 'Active' && s.delivery === 'Pending').length,
                
                inTransit: salesOrders.filter(s => s.delivery === 'In Transit').length,
                
                delivered: salesOrders.filter(s => s.status === 'Completed' || s.delivery === 'Delivered').length,
                
                qtyOnHand: totalQty,
                qtyToReceive: 240 
            },
            productDetails: {
                allItems: inventory.length,
                lowStock: inventory.filter(p => p.qty < 20).length,
                expired: 0,
                products: inventory.length
            },
            sales: {
                totalValue: totalRev,
                deliveryToClient: totalRev > 0 ? Math.round((instRevenue / totalRev) * 100) : 50,
                walkInCustomer: totalRev > 0 ? Math.round((posRevenue / totalRev) * 100) : 50
            },
            // Mapping 'client' from sales.json
            topClients: salesOrders.slice(0, 3).map(s => s.client || "Institutional Client"),
            topProducts: inventory.sort((a,b) => b.qty - a.qty).slice(0, 2).map(p => p.name),
            
            financials: {
                monthlyTarget: 500000,
                progress: Math.round((totalRev / 500000) * 100)
            },
            forecast: inventory.filter(p => p.qty < 20).slice(0, 3).map(p => ({
                name: p.name,
                daysRemaining: Math.floor(p.qty / 4)
            })),
            activeStaff: staff.length,
            recentActivity: [
                { time: "Just now", event: `Database synchronized with ${salesOrders.length} orders`, type: "success" },
                { time: "Update", event: `Inventory Total: ${totalQty} units`, type: "info" }
            ]
        };

        res.render('pages/admin/index', {
            title: 'Operations Dashboard',
            active: 'dashboard',
            userRole: 'Admin',
            adminName: admins[0]?.name || "Super Admin", 
            data: liveData
        });

    } catch (err) { 
        console.error("Dashboard Error:", err);
        res.status(500).send("Critical error loading data."); 
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(); 
    res.redirect('/');
});

module.exports = router;