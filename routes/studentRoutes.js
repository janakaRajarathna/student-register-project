const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/dashboard', (req, res) => {
    req.studentController.getDashboard(req, res);
});

// Submit assignment route
router.get('/submit-assignment', (req, res) => {
    req.studentController.getSubmitAssignment(req, res);
});

module.exports = router; 