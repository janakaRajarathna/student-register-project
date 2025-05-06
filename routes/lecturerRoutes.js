const express = require('express');
const router = express.Router();

// Lecturer dashboard
router.get('/dashboard', (req, res) => {
    req.lecturerController.getDashboard(req, res);
});

// Create assignment page
router.get('/create-assignment', (req, res) => {
    res.render('lecturer/create-assignment', { user: req.session.user });
});

// Handle assignment creation
router.post('/create-assignment', (req, res) => {
    req.lecturerController.createAssignment(req, res);
});

module.exports = router; 