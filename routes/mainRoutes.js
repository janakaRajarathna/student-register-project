const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const apiController = require('../controllers/apiController');

// Page routes
router.get('/', pageController.getDashboard);
router.get('/home', pageController.getHome);
router.get('/profile', pageController.getProfile);

// API routes
router.get('/api/user', apiController.getUserData);
router.get('/api/dashboard/stats', apiController.getDashboardStats);

module.exports = router; 