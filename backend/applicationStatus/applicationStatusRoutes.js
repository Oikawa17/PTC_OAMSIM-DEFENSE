const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
console.log('applicationStatusRoutes loaded');
// Database connection config
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'main'
};

router.get('/:application_id', async (req, res) => {
  const { application_id } = req.params;
  console.log('Status: Received application_id:', application_id);
  let db;
  try {
    db = await mysql.createConnection(dbConfig);

    // Check if student_info has a record with populated first_name and last_name
    const [studentRows] = await db.query(
      `SELECT first_name, last_name FROM student_info WHERE application_id = ?`,
      [application_id]
    );

    let applicationFormStatus = 'Pending';
    if (
      studentRows.length > 0 &&
      studentRows[0].first_name &&
      studentRows[0].last_name
    ) {
      applicationFormStatus = 'Completed';
    }

    // Document Requirements Status
    const [docRows] = await db.query(
      `SELECT 
        (form_137 IN ('Submitted', 'Verified')) AS form_137,
        (form_138 IN ('Submitted', 'Verified')) AS form_138,
        (birth_certificate IN ('Submitted', 'Verified')) AS birth_certificate,
        (good_moral IN ('Submitted', 'Verified')) AS good_moral,
        (med_certificate IN ('Submitted', 'Verified')) AS med_certificate,
        (id_photos IN ('Submitted', 'Verified')) AS id_photos,
        (recommendation_letter IN ('Submitted', 'Verified')) AS recommendation_letter
      FROM doc_uploaded
      WHERE application_id = ?`,
      [application_id]
    );

    const totalRequired = 7;
    let submittedCount = 0;
    let submittedFields = [];
    if (docRows.length > 0) {
      const doc = docRows[0];
      submittedCount =
        Number(doc.form_137) +
        Number(doc.form_138) +
        Number(doc.birth_certificate) +
        Number(doc.good_moral) +
        Number(doc.med_certificate) +
        Number(doc.id_photos) +
        Number(doc.recommendation_letter);

      // Collect which fields are submitted
      if (doc.form_137) submittedFields.push('Form 137');
      if (doc.form_138) submittedFields.push('Form 138');
      if (doc.birth_certificate) submittedFields.push('Birth Certificate');
      if (doc.good_moral) submittedFields.push('Good Moral');
      if (doc.med_certificate) submittedFields.push('Medical Certificate');
      if (doc.id_photos) submittedFields.push('ID Photos');
      if (doc.recommendation_letter) submittedFields.push('Recommendation Letter');
    }

    let documentRequirementsStatus = 'Pending';
    if (submittedCount === totalRequired) {
      documentRequirementsStatus = 'Completed';
    } else {
      documentRequirementsStatus = `Pending (${submittedCount} of ${totalRequired})`;
    }

    // Application Fee Payment Status (improved logic)
    // Get sum for pending and verified, handle nulls, and check for all verified
    const [pendingRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM PAYMENTS
       WHERE application_id = ? AND LOWER(status) = 'pending'`,
      [application_id]
    );
    const [verifiedRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM PAYMENTS
       WHERE application_id = ? AND LOWER(status) = 'verified'`,
      [application_id]
    );

    const paymentAmountPending = Number(pendingRows[0].total) || 0;
    const paymentAmountVerified = Number(verifiedRows[0].total) || 0;

    // Check if there are any pending payments
    const [anyPendingRows] = await db.query(
      `SELECT COUNT(*) AS cnt
       FROM PAYMENTS
       WHERE application_id = ? AND LOWER(status) = 'pending'`,
      [application_id]
    );
    const hasPending = anyPendingRows[0].cnt > 0;

    // Check if all payments are verified and sum is enough
    const [allRows] = await db.query(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN LOWER(status) = 'verified' THEN 1 ELSE 0 END) AS verified_count
       FROM PAYMENTS
       WHERE application_id = ?`,
      [application_id]
    );
    const allVerified = allRows[0].total > 0 && allRows[0].total === allRows[0].verified_count;

    let paymentStatus = 'Pending Verification (₱0)';
    if (allVerified && paymentAmountVerified >= 1000) {
      paymentStatus = 'Completed';
    } else if (hasPending) {
      paymentStatus = `Pending Verification (₱${paymentAmountPending})|Verified (₱${paymentAmountVerified})`;
    } else {
      paymentStatus = `Verified (₱${paymentAmountVerified})`;
    }

    res.json({
      applicationFormStatus,
      documentRequirementsStatus,
      submittedCount,
      totalRequired,
      submittedFields,
      paymentStatus,
      paymentAmountPending,
      paymentAmountVerified
    });

    await db.end();
  } catch (error) {
    if (db) await db.end();
    console.error(error);
    res.status(500).json({ message: "Error fetching application status." });
  }
});


// GET /application-details/:application_id
router.get('/application-details/:application_id', async (req, res) => {
  const { application_id } = req.params;
  let db;
  try {
    db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query(
      `SELECT application_id, first_choice, second_choice
       FROM student_info
       WHERE application_id = ?`,
      [application_id]
    );
    await db.end();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (db) await db.end();
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /exam-schedule/:application_id
router.get('/exam-schedule/:application_id', async (req, res) => {
  const { application_id } = req.params;
  let db;
  try {
    db = await mysql.createConnection(dbConfig);
    const [rows] = await db.query(
      `SELECT exam_schedule FROM exam WHERE application_id = ? LIMIT 1`,
      [application_id]
    );
    await db.end();
    if (rows.length === 0) {
      return res.json({ exam_schedule: null });
    }
    res.json({ exam_schedule: rows[0].exam_schedule });
  } catch (err) {
    if (db) await db.end();
    res.status(500).json({ error: 'Database error' });
  }
});
module.exports = router;