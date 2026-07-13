const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
    title: String,
    url: String,
    content: String,
    summary: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Memory', memorySchema);