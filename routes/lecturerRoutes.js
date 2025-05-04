const express = require('express');
const router = express.Router();

// Lecturer dashboard
router.get('/dashboard', (req, res) => {
    req.lecturerController.getDashboard(req, res);
});

module.exports = router; 