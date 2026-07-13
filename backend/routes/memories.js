const express = require('express');
const router = express.Router();
const Memory = require('../models/Memory');
const axios = require('axios');

router.get('/all', async (req, res) => {
    try {
        const memories = await Memory.find().sort({ createdAt: -1 });
        res.json(memories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/save', async (req, res) => {
    try {
        const { title, url, content } = req.body;
        
        // AI Summary Logic (Groq API)
        const aiResponse = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: `Summarize: ${content.substring(0, 1000)}` }]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        });

        const summary = aiResponse.data.choices[0].message.content;

        const newMemory = new Memory({ title, url, content, summary });
        await newMemory.save();
        res.status(201).json({ message: "Saved!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;