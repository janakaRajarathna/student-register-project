const express = require('express');
const router = express.Router();

// Admin dashboard route
router.get('/dashboard', (req, res) => {
    req.adminController.getDashboard(req, res);
});

// User management routes
router.get('/users', (req, res) => {
    req.adminController.getUsers(req, res);
});

// Subject management routes
router.get('/subjects', (req, res) => {
    req.adminController.getSubjects(req, res);
});

// Assignment management routes
router.get('/assignments', (req, res) => {
    req.adminController.getAssignments(req, res);
});

module.exports = router; 