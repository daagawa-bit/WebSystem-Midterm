function staffFilter() {
    const q = document.getElementById('staffSearch').value.toLowerCase();
    const cat = document.getElementById('catFilter').value.toLowerCase();
    const cards = document.querySelectorAll('.item-card');
    
    cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const pCat = card.getAttribute('data-cat');
        
        const matchSearch = name.includes(q);
        const matchCat = cat === 'all' || pCat === cat;
        
        card.style.display = (matchSearch && matchCat) ? 'block' : 'none';
    });
}

function filterBy(type) {
    const cards = document.querySelectorAll('.item-card');
    const buttons = document.querySelectorAll('.quick-filter-btn');
    
    buttons.forEach(btn => btn.classList.remove('active-filter'));
    event.currentTarget.classList.add('active-filter');

    cards.forEach(card => {
        if (type === 'low') {
            card.style.display = (card.getAttribute('data-low') === 'true') ? 'block' : 'none';
        } else if (type === 'expiring') {
            card.style.display = (card.getAttribute('data-expiring') === 'true') ? 'block' : 'none';
        } else {
            card.style.display = 'block';
        }
    });
}