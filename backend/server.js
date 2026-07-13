const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Screenshot Save Logic
app.post('/api/memories/auto-save', (req, res) => {
    const { title, category } = req.body;
    const dir = path.join(__dirname, 'memories', category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    res.sendStatus(200);
});

// PARTNER KA KAAM: List fetch logic
app.get('/api/files', (req, res) => {
    const dir = path.join(__dirname, 'memories');
    if (!fs.existsSync(dir)) return res.json([]);
    const folders = fs.readdirSync(dir);
    res.json(folders); // Returns list of captured websites
});

app.listen(5000, () => console.log("Server Running on 5000"));