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

// My Assignments page
router.get('/assignments-page', (req, res) => {
    req.lecturerController.getAssignmentsPage(req, res);
});

// All Submissions page
router.get('/submissions', (req, res) => {
    req.lecturerController.getSubmissionsPage(req, res);
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

// Get subjects for the logged-in lecturer
router.get('/subjects', (req, res) => {
    req.lecturerController.getSubjects(req, res);
});

// Get all submissions for the lecturer
router.get('/all-submissions', (req, res) => {
    req.lecturerController.getAllSubmissions(req, res);
});

// Reports page
router.get('/reports', (req, res) => {
    req.lecturerController.getReportsPage(req, res);
});

// Get student performance data for reports
router.get('/student-performance/:studentId', (req, res) => {
    req.lecturerController.getStudentPerformance(req, res);
});

module.exports = router; 