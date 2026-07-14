const mongoose = require('mongoose');

// A single auto-capture event: screenshot + page metadata
const captureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
  domain: { type: String, default: '' },
  // page text extracted by content script (first 3000 chars)
  pageText: { type: String, default: '' },
  // base64 screenshot (data:image/png;base64,...)
  screenshot: { type: String, default: '' },
  // AI-generated summary of this capture
  summary: { type: String, default: '' },
  // rough category auto-assigned by AI
  category: { type: String, default: 'Uncategorized' },
  capturedAt: { type: Date, default: Date.now, index: true },
});

// Text index on title + pageText + summary for fast keyword search
captureSchema.index({ userId: 1, capturedAt: -1 });
captureSchema.index({ title: 'text', pageText: 'text', summary: 'text' });

module.exports = mongoose.model('Capture', captureSchema);
