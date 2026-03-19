const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const chatPath = path.join(__dirname, '../../data/chatbot.json');
const readData = () => {
    if (!fs.existsSync(chatPath)) return { activeChats: [], quickReplies: [] };
    return JSON.parse(fs.readFileSync(chatPath, 'utf8'));
};

router.get('/', (req, res) => {
    const data = readData();
    const activeId = req.query.id || (data.activeChats.length > 0 ? data.activeChats[0].id : null);
    const currentChat = data.activeChats.find(c => c.id === activeId);

    const kb = data.knowledgeBase || [];

    res.render('pages/staff/queries', {
        title: 'Query Terminal',
        active: 'chatbot', 
        userRole: 'Staff',
        chats: data.activeChats,
        currentChat: currentChat,
        quickReplies: data.quickReplies || ["Order verified", "Stock out", "Checking..."],
        kb: kb
    });
});

router.post('/reply/:id', (req, res) => {
    let data = readData();
    const index = data.activeChats.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data.activeChats[index].messages.push({
            sender: "Staff",
            text: req.body.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: req.body.isInternal === "true" ? "internal" : "public"
        });
        data.activeChats[index].status = "Staff Handling";
        fs.writeFileSync(chatPath, JSON.stringify(data, null, 2));
    }
    res.redirect('/staff/chatbot?id=' + req.params.id);
});

router.get('/resolve/:id', (req, res) => {
    let data = readData();
    data.activeChats = data.activeChats.filter(c => c.id !== req.params.id);
    fs.writeFileSync(chatPath, JSON.stringify(data, null, 2));
    res.redirect('/staff/chatbot');
});

module.exports = router;