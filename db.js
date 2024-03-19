'use strict';

const sqlite = require('sqlite3').verbose();

// open database
const db = new sqlite.Database('birdspotter.db', (err) => {
  if (err) throw err;
  else console.log("Successfully connected to 'birdspotter.db'.");
});

module.exports = db;