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

// Get all assignments for the lecturer
router.get('/assignments', (req, res) => {
    req.lecturerController.getAssignments(req, res);
});

// Get a single assignment
router.get('/assignments/:id', (req, res) => {
    req.lecturerController.getAssignment(req, res);
});

// Update an assignment
router.put('/assignments/:id', (req, res) => {
    req.lecturerController.updateAssignment(req, res);
});

// Delete an assignment
router.delete('/assignments/:id', (req, res) => {
    req.lecturerController.deleteAssignment(req, res);
});

// Get submission preview
router.get('/submission/:id/preview', (req, res) => {
    req.lecturerController.getSubmissionPreview(req, res);
});

// Submit grade for a submission
router.post('/submission/grade', (req, res) => {
    req.lecturerController.submitGrade(req, res);
});

// Get performance for a single assignment
router.get('/performance/:assignmentId', (req, res) => {
    req.lecturerController.getAssignmentPerformance(req, res);
});

// Get grade distribution for a single assignment
router.get('/grade-distribution/:assignmentId', (req, res) => {
    req.lecturerController.getGradeDistribution(req, res);
});

module.exports = router; 