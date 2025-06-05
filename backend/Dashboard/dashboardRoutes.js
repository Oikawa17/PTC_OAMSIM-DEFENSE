const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the dashboard!',
    links: [
      { name: 'Application Form', path: '/application-form' },
      { name: 'Application Status', path: '/application-status' },
      { name: 'Payment Information', path: '/payment-information' },
      { name: 'Document Upload', path: '/document-upload' },
      { name: 'Messages', path: '/messages' },
      { name: 'Profile', path: '/profile' },
      { name: 'Settings', path: '/settings' }
    ]
  });
});

module.exports = router;
