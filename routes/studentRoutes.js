const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/dashboard', (req, res) => {
    req.studentController.getDashboard(req, res);
});

// Submit assignment routes
router.get('/submit-assignment', (req, res) => {
    req.studentController.getSubmitAssignment(req, res);
});

// Submission preview route
router.get('/submission/:id/preview', (req, res) => {
    req.studentController.getSubmissionPreview(req, res);
});

router.post('/submit-assignment', (req, res) => {
    req.studentController.submitAssignment(req, res);
});

module.exports = router; 