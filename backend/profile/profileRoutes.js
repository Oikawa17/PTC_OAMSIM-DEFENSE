const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use promise API for async/await
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'main'
}).promise();

// Multer storage config
const storage = multer.diskStorage({
  destination: function (_, __, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const applicationid = req.params.applicationid;
    const ext = path.extname(file.originalname);
    cb(null, `profile_${applicationid}${ext}`);
  }
});
const upload = multer({ storage });

// GET profile info (include profile_pic and birthdate as string)
router.get('/:applicationid', async (req, res) => {
  try {
    const { applicationid } = req.params;
    const [rows] = await db.query(
      `SELECT 
        application_id,
        first_name, 
        last_name, 
        CONCAT(first_name, ' ', last_name) AS full_name, 
        email, 
        phone, 
        address, 
        profile_pic, 
        DATE_FORMAT(birthdate, '%Y-%m-%d') AS birthdate
      FROM student_info WHERE application_id = ?`,
      [applicationid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT: Upload or update profile picture
router.put('/:applicationid/picture', upload.single('profilePic'), async (req, res) => {
  try {
    const { applicationid } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "No picture provided." });
    }

    const filePath = `/uploads/${req.file.filename}`; // URL to access the image

    // Save file path in DB
    const [result] = await db.query(
      `UPDATE student_info SET profile_pic = ? WHERE application_id = ?`,
      [filePath, applicationid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ success: true, message: "Profile picture updated successfully.", profile_pic: filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Password update route (unchanged)
router.put('/:applicationid/password', async (req, res) => {
  try {
    const { applicationid } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const [result] = await db.query(
      `UPDATE student_info SET password = ? WHERE application_id = ?`,
      [newPassword, applicationid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;