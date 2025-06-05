const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'main'
});

// Get all messages for a user
router.get('/:application_id', (req, res) => {
  const { application_id } = req.params;
  db.query(
    'SELECT * FROM messages WHERE application_id = ? ORDER BY created_at ASC',
    [application_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});

// Send a new message
router.post('/', (req, res) => {
  const { application_id, sender, message } = req.body;
  if (!application_id || !sender || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.query(
    'INSERT INTO messages (application_id, sender, message) VALUES (?, ?, ?)',
    [application_id, sender, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.status(201).json({ id: result.insertId, application_id, sender, message });
    }
  );
});

module.exports = router;