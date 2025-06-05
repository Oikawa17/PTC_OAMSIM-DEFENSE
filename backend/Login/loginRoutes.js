const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'main'
});

// Function to create a folder if it doesn't exist
const createFolder = (application_id) => {
  const folderPath = path.join(__dirname, '../uploads', application_id);
  console.log("Folderpath:", folderPath);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder "${application_id}" created inside "uploads/"`);
  }
};

router.post('/', (req, res) => {
  const { application_id, password } = req.body;

  db.query(
    'SELECT * FROM student_info WHERE application_id = ?',
    [application_id],
    async (err, results) => {
      if (err) return res.status(500).send(err);

      const user = results[0];
      if (!user) return res.status(404).send('User not found');
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).send('Incorrect password');
      if (user.is_temp) {
        if (password !== user.password) {
          return res.status(401).send('Incorrect password');
        }
        createFolder(application_id);
        return res.status(200).json({ changePassword: true, application_id: user.application_id });
      }
      createFolder(application_id);
      res.status(200).json({ dashboard: true, application_id: user.application_id });
      // ✅ Insert application_id into doc_uploaded if it doesn’t exist
      db.query(
        `INSERT INTO doc_uploaded (application_id) 
         SELECT ? FROM DUAL 
         WHERE NOT EXISTS (SELECT application_id FROM doc_uploaded WHERE application_id = ?)`,
        [application_id, application_id],
        (err) => {
          if (err) {
            console.error("Database Insert Error:", err);
            // Don't send error to client here, since login already succeeded
          }
          console.log(`Application ID ${application_id} inserted into doc_uploaded if missing.`);
        }
      );
    }
  );
});

router.post('/change-password', async (req, res) => {
  const { application_id, newPassword } = req.body;

  try {
    // Hash the new password before storing it
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = 'UPDATE student_info SET password = ?, is_temp = 0 WHERE application_id = ?';
    
    db.query(query, [hashedPassword, application_id], (err, result) => {
      if (err) return res.status(500).send('Database error');
      if (result.affectedRows === 0) return res.status(404).send('User not found');

      createFolder(application_id);
      res.status(200).send('Password updated successfully');
    });
  } catch (error) {
    console.error('Hashing Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
