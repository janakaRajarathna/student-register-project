const express = require('express');
const router = express.Router();

// Login routes
router.get('/login', (req, res) => {
    req.authController.getLogin(req, res);
});

router.post('/login', (req, res) => {
    req.authController.postLogin(req, res);
});

// Register routes
router.get('/register', (req, res) => {
    req.authController.getRegister(req, res);
});

router.post('/register', (req, res) => {
    req.authController.postRegister(req, res);
});

// Logout route
router.get('/logout', (req, res) => {
    req.authController.logout(req, res);
});

module.exports = router; 