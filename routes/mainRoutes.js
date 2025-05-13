const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const apiController = require('../controllers/apiController');


// API routes
router.get('/api/user', apiController.getUserData);
router.get('/api/dashboard/stats', apiController.getDashboardStats);

module.exports = router; 