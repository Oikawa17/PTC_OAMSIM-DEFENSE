const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const router = express.Router();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'main'
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Connected to MySQL');
});


// Multer storage: save to ./uploads, filename: <category>.<ext>
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = `./uploads`;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const category = req.params.category;
        const fileExtension = path.extname(file.originalname);
        cb(null, `${category}${fileExtension}`);
    }
});

const upload = multer({ storage });

// Upload endpoint
router.post('/upload/:category', upload.single('file'), (req, res) => {
    const applicationId = req.body.application_id;
    console.log('Upload: Received application_id:', applicationId);
    const category = req.params.category;

    if (!applicationId) {
        return res.status(400).json({ message: "Application ID is missing from request." });
    }
    if (!req.file) {
        return res.status(400).json({ message: `No file uploaded for ${category}` });
    }
    
    const fileExtension = path.extname(req.file.originalname);
    const newFilename = `${applicationId}_${category}${fileExtension}`;
    const uploadPath = `uploads/${applicationId}/${newFilename}`;

    fs.renameSync(req.file.path, uploadPath); // Rename file correctly

    // Mark as Submitted in DB
    db.query(
        `UPDATE doc_uploaded SET ${category} = 'Submitted' WHERE application_id = ?`,
        [applicationId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database update failed' });
            res.json({
                message: `${category} uploaded successfully!`,
                filePath: req.file.path
            });
        }
    );
});

// Status endpoint: returns the doc_uploaded row for the user
router.get('/status/:application_id', (req, res) => {
    const applicationId = req.params.application_id;
    db.query('SELECT * FROM doc_uploaded WHERE application_id = ?', [applicationId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(404).json({});
        res.json(results[0]);
    });
});

// Endpoint to mark a document as Verified (admin use)
router.post('/verify/:category', express.json(), (req, res) => {
    const applicationId = req.body.application_id;
    const category = req.params.category;
    if (!applicationId) {
        return res.status(400).json({ message: "Application ID is missing from request." });
    }
    db.query(
        `UPDATE doc_uploaded SET ${category} = 'Verified' WHERE application_id = ?`,
        [applicationId],
        (err) => {
            if (err) return res.status(500).json({ error: 'Database update failed' });
            res.json({ message: `${category} marked as Verified!` });
        }
    );
});

module.exports = router;