const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs'); 

const loginRoutes = require('./Login/loginRoutes');
const dashboardRoutes = require('./Dashboard/dashboardRoutes');
const applicationRoutes = require('./applicationForm/applicationRoutes');
const documentuploadRoutes = require('./documentUpload/documentuploadRoutes');
const applicationStatusRoutes = require('./applicationStatus/applicationStatusRoutes');
const messageRoutes = require('./messages/messageRoutes');
const paymentRoutes = require('./payment/paymentRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/login', loginRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/application-form', applicationRoutes);
app.use('/document-upload', documentuploadRoutes); // Register upload route
app.use('/application-status', applicationStatusRoutes); // Register status route
app.use('/messages', messageRoutes);
app.use('/payment', paymentRoutes);

// Make sure the path and filename are correct and match the actual file
const profileRoutes = require('./profile/profileRoutes'); // Check that 'profileRoutes.js' exists in the 'profile' folder
app.use('/profile', profileRoutes);

module.exports = app;