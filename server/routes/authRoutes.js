const express = require('express');
const { login, logout, register, getCurrentUser, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.post('/refresh-token', refreshToken);

module.exports = router;