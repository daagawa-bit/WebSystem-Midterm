const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Paths to your data files
const dataDir = path.join(__dirname, '../../data');
const paths = {
    inventory: path.join(dataDir, 'inventory.json'),
    clients: path.join(dataDir, 'clients.json'),
    suppliers: path.join(dataDir, 'suppliers.json'),
    sales: path.join(dataDir, 'sales.json'),
    admins: path.join(dataDir, 'admins.json'),        // Separate Admin DB
    staff: path.join(dataDir, 'staff_members.json')   // Separate Staff DB
};

// SAFE READ FUNCTION: Preserved from your code
const getSafeData = (filePath, key) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.log("File not found:", filePath);
            return [];
        }
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim() === "") return [];
        
        const parsed = JSON.parse(content);
        
        // SMART CHECK: If the file is a flat array [...], return it immediately.
        // If it's an object { key: [...] }, look for the key.
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            return parsed[key] || [];
        }
    } catch (err) {
        console.error("JSON Error in " + filePath, err);
        return [];
    }
};

/**
 * 1. LANDING PAGE (Root)
 */
router.get('/', (req, res) => {
    res.render('pages/admin/login', { title: 'Admin & Staff Login', active: 'login' });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const inputEmail = email.toLowerCase().trim();
    const inputPass = password.toString().trim();

    try {
        // 1. Check Admin Database (data/admins.json)
        const admins = getSafeData(paths.admins, 'admins'); // uses your getSafeData helper
        const adminUser = admins.find(u => 
            u.email.toLowerCase().trim() === inputEmail && 
            u.password.toString().trim() === inputPass
        );

        if (adminUser) {
            console.log("Admin Logged In:", adminUser.name);
            return res.redirect('/dashboard');
        }

        // 2. Check Staff Database (data/staff_members.json)
        const staffMembers = getSafeData(paths.staff, 'staff');
        const staffUser = staffMembers.find(u => 
            u.email.toLowerCase().trim() === inputEmail && 
            u.password.toString().trim() === inputPass
        );

        if (staffUser) {
            console.log("Staff Logged In:", staffUser.name);
            return res.redirect('/staff');
        }

        // 3. Neither matches
        res.send("<script>alert('Invalid Internal Credentials'); window.location='/';</script>");

    } catch (err) {
        console.error("Login Failure:", err);
        res.status(500).send("Login System Error.");
    }
});

/**
 * 3. OPERATIONS DASHBOARD (Kept exactly as you provided)
 */
router.get('/dashboard', (req, res) => {
    try {
        const inventory = getSafeData(paths.inventory, 'products');
        const clients = getSafeData(paths.clients, 'clients');
        const suppliers = getSafeData(paths.suppliers, 'suppliers');
        const sales = getSafeData(paths.sales, 'salesOrders');

        // REAL-TIME CALCULATIONS
        const totalQty = inventory.reduce((sum, p) => sum + (p.qty || 0), 0);
        const lowStockCount = inventory.filter(p => p.qty < 10).length;
        const totalSalesVal = sales.reduce((sum, o) => sum + (o.total || 0), 0);

        // Construct the dynamic data object
        const liveData = {
            kpi: {
                salesPending: sales.filter(s => s.status === 'Active').length,
                inTransit: 2,
                delivered: sales.filter(s => s.status === 'Completed').length,
                qtyOnHand: totalQty,
                qtyToReceive: 120
            },
            productDetails: {
                allItems: inventory.length,
                lowStock: lowStockCount,
                expired: 0,
                products: inventory.length
            },
            sales: {
                totalValue: totalSalesVal,
                walkInCustomer: 25,
                deliveryToClient: 75 
            },
            topClients: clients.slice(0, 3).map(c => c.facilityName || c.name || "Unknown"),
            topProducts: inventory.slice(0, 2).map(p => p.name || "Unnamed Product"),

            recentActivity: [
                {
                    time: "Just now",
                    event: inventory.length > 0 ? `Inventory verified: ${inventory[0].name}` : "System Initialized",
                    type: "success"
                },
                {
                    time: "Update",
                    event: `Monitoring ${clients.length} Institutional Clients`,
                    type: "info"
                }
            ]
        };

        res.render('pages/admin/index', {
            title: 'Operations Dashboard',
            active: 'dashboard',
            userRole: 'Admin',
            data: liveData
        });

    } catch (err) {
        console.error("Dashboard Logic Error:", err);
        res.status(500).send("Check your data folder for missing or empty JSON files.");
    }
});

router.get('/logout', (req, res) => { res.redirect('/'); });

module.exports = router;