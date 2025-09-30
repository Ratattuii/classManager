const express = require('express');
const router = express.Router();
const { login, verifyToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', authenticateToken, verifyToken);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

module.exports = router;
