const express = require('express');
const router = express.Router();

// Dashboard route
router.get('/dashboard', (req, res) => {
    req.adminController.getDashboard(req, res);
});

// Subject routes
router.get('/subjects', (req, res) => {
    req.adminController.getSubjects(req, res);
});

router.post('/subjects', (req, res) => {
    req.adminController.createSubject(req, res);
});

router.put('/subjects/:id', (req, res) => {
    req.adminController.updateSubject(req, res);
});

router.delete('/subjects/:id', (req, res) => {
    req.adminController.deleteSubject(req, res);
});

// User management routes
router.get('/users', (req, res) => {
    req.adminController.getUsers(req, res);
});

router.get('/users/new', (req, res) => {
    req.adminController.getNewUserForm(req, res);
});

router.post('/users', (req, res) => {
    req.adminController.createUser(req, res);
});

router.put('/users/:id', (req, res) => {
    req.adminController.updateUser(req, res);
});

router.delete('/users/:id', (req, res) => {
    req.adminController.deleteUser(req, res);
});

router.put('/users/:id/status', (req, res) => {
    req.adminController.toggleUserStatus(req, res);
});

// Assignment routes
router.get('/assignments', (req, res) => {
    req.adminController.getAssignments(req, res);
});

// Report routes
router.get('/reports', (req, res) => {
    req.adminController.getReports(req, res);
});

router.get('/reports/generate', (req, res) => {
    req.adminController.generateReport(req, res);
});

module.exports = router; 