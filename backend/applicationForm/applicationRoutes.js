const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'main'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database.');
  }
});

// Submit Route (update as needed)
router.post('/submit', (req, res) => {
  const { 
    firstName, middleName, lastName, email, phone, address, city, province, zip, birthdate, gender, civilStatus, 
    lastSchoolAttended, schoolAddress, yearGraduated, trackStrand, generalAverage, 
    firstChoice, secondChoice, emergencyContactName, emergencyContactNumber, emergencyContactRelationship, application_id
  } = req.body;

  if (!application_id) {
    return res.status(400).json({ error: 'Application ID is required.' });
  }

  // Update student_info table with submitted data
  const query = `
    UPDATE student_info 
    SET first_name = ?, middle_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, province = ?, zip = ?, 
    birthdate = ?, gender = ?, civil_status = ?, 
    last_school_attended = ?, school_address = ?, year_graduated = ?, track_strand = ?, general_average = ?, 
    first_choice = ?, second_choice = ?, emergency_contact_name = ?, emergency_contact_number = ?, emergency_contact_relationship = ?
    WHERE application_id = ?
  `;

  db.query(query, [
    firstName, middleName, lastName, email, phone, address, city, province, zip, birthdate, gender, civilStatus, 
    lastSchoolAttended, schoolAddress, yearGraduated, trackStrand, generalAverage, 
    firstChoice, secondChoice, emergencyContactName, emergencyContactNumber, emergencyContactRelationship, application_id
  ], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Submit Database error', details: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No record found to update.' });
    }
    res.status(200).json({ message: 'Application updated successfully!' });
  });
});

// Application status: lock if all required fields are filled
router.get('/application-status/:applicationId', (req, res) => {
  const { applicationId } = req.params;

  db.query(
    `SELECT first_name, middle_name, last_name, email, phone, address, city, province, zip, birthdate, gender, civil_status, last_school_attended, school_address, year_graduated, track_strand, general_average, first_choice, second_choice
     FROM student_info WHERE application_id = ?`,
    [applicationId],
    (err, result) => {
      if (err) {
        console.error("Status Database Error:", err);
        return res.status(500).json({ error: 'Database retrieval failed' });
      }
      if (!result.length) {
        // No record yet, allow access
        console.log(`Application ID ${applicationId} is NOT locked (no record found).`);
        return res.json({ locked: false });
      }
      // Check if any required field is missing or empty
      const info = result[0];
      const requiredFields = [
        'first_name','middle_name', 'last_name', 'email', 'phone', 'address', 'city', 'province', 'zip',
        'birthdate', 'gender', 'civil_status', 'last_school_attended', 'school_address',
        'year_graduated', 'track_strand', 'general_average', 'first_choice', 'second_choice'
      ];
      const isComplete = requiredFields.every(field => info[field] && info[field].toString().trim() !== '');
      if (isComplete) {
        console.log(`Application ID ${applicationId} is LOCKED (all required fields filled).`);
      } else {
        console.log(`Application ID ${applicationId} is NOT locked (incomplete fields).`);
      }
      return res.json({ locked: isComplete });
    }
  );
});

// Get all info for locked application
router.get('/info/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  db.query(
    `SELECT * FROM student_info WHERE application_id = ?`,
    [applicationId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database retrieval failed' });
      }
      if (!result.length) {
        return res.status(404).json({ error: 'No record found.' });
      }
      res.json(result[0]);
    }
  );
});

module.exports = router;
