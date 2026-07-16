const test = require('node:test');
const assert = require('node:assert/strict');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Capture = require('../models/Capture');

test('Capture saves visual description and metadata in MongoDB', async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  const email = `mongo-test-${Date.now()}@example.com`;
  const user = await User.create({ name: 'Mongo Test', email, password: 'secret123' });

  const capture = await Capture.create({
    userId: user._id,
    url: 'https://example.com/test',
    title: 'Mongo Test Page',
    domain: 'example.com',
    pageText: 'hello world',
    screenshot: 'data:image/png;base64,abc',
    summary: 'Test summary',
    visualDescription: 'A test screenshot with a button',
    category: 'Other',
  });

  const saved = await Capture.findById(capture._id).lean();
  assert.equal(saved.title, 'Mongo Test Page');
  assert.equal(saved.visualDescription, 'A test screenshot with a button');

  await Capture.deleteMany({ userId: user._id });
  await User.findByIdAndDelete(user._id);
  await mongoose.disconnect();
});
