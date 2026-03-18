// ... existing requires ...

const dataPath = path.join(__dirname, '../../data/inventory.json');
const getInventory = () => JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// READ
router.get('/', (req, res) => {
    res.render('pages/admin/inventory', {
        title: 'Inventory', active: 'inventory', userRole: 'Admin',
        inventory: getInventory()
    });
});

// CREATE
router.post('/add', (req, res) => {
    const inventory = getInventory();
    const newProd = {
        id: "SKU-" + Date.now().toString().slice(-4),
        ...req.body,
        qty: parseInt(req.body.qty),
        status: parseInt(req.body.qty) < 20 ? "Low Stock" : "Good"
    };
    inventory.push(newProd);
    fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    res.redirect('/inventory');
});

// UPDATE (POST)
router.post('/edit/:id', (req, res) => {
    const inventory = getInventory();
    const index = inventory.findIndex(i => i.id === req.params.id);
    if (index !== -1) {
        inventory[index] = {
            id: req.params.id,
            ...req.body,
            qty: parseInt(req.body.qty),
            status: parseInt(req.body.qty) < 20 ? "Low Stock" : "Good"
        };
        fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    }
    res.redirect('/inventory');
});

// DELETE (GET)
router.get('/delete/:id', (req, res) => {
    let inventory = getInventory();
    inventory = inventory.filter(i => i.id !== req.params.id);
    fs.writeFileSync(dataPath, JSON.stringify(inventory, null, 2));
    res.redirect('/inventory');
});

module.exports = router;