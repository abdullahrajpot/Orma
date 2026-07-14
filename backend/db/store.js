// db/store.js — JSON file store (lowdb v1, CommonJS)
// Used as a fallback when MongoDB is not available.

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const adapter = new FileSync(path.join(__dirname, 'data.json'));
const db = low(adapter);

db.defaults({ users: [], captures: [] }).write();

module.exports = { db, uuidv4 };
