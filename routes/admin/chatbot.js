const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const chatPath = path.join(__dirname, '../../data/chatbot.json');
const readData = () => JSON.parse(fs.readFileSync(chatPath, 'utf8'));
const saveData = (data) => fs.writeFileSync(chatPath, JSON.stringify(data, null, 2));

// Main Chat Page
router.get('/', (req, res) => {
    const data = readData();
    const activeId = req.query.id || (data.activeChats.length > 0 ? data.activeChats[0].id : null);
    const currentChat = data.activeChats.find(c => c.id === activeId);

    res.render('pages/admin/chatbot', {
        title: 'Chatbot Handling',
        active: 'chatbot',
        userRole: 'Admin',
        chats: data.activeChats,
        currentChat: currentChat,
        quickReplies: data.quickReplies,
        kb: data.knowledgeBase
    });
});

// Admin sends message
router.post('/send/:id', (req, res) => {
    let data = readData();
    const index = data.activeChats.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
        data.activeChats[index].messages.push({
            sender: "Admin",
            text: req.body.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        data.activeChats[index].status = "Staff Handling";
        saveData(data);
    }
    res.redirect('/chatbot?id=' + req.params.id);
});

// Add to Knowledge Base (Teach Bot)
router.post('/kb/add', (req, res) => {
    let data = readData();
    const newRule = { 
        id: Date.now().toString(), // Use string to match params consistently
        trigger: req.body.trigger.toLowerCase(), 
        response: req.body.response 
    };
    data.knowledgeBase.push(newRule);
    saveData(data);
    res.redirect('/chatbot'); // Redirect to main to see changes
});

// Delete Knowledge Base Rule
router.get('/kb/delete/:id', (req, res) => {
    let data = readData();
    // Use != to catch both string and number IDs
    data.knowledgeBase = data.knowledgeBase.filter(k => k.id != req.params.id);
    saveData(data);
    res.redirect('/chatbot');
});

module.exports = router;