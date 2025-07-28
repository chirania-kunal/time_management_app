const express = require('express');
const router = express.Router();

const { 
  register,  
  login, 
  getMe,
  updateProfile,
  updatePassword
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

// ==========================
// 🔓 Public Routes
// ==========================
router.post('/register', register);  // Register a new user
router.post('/login', login);        // Login and get token

// ==========================
// 🔒 Protected Routes
// ==========================
router.get('/me', protect, getMe);                      // Get current user's profile
router.put('/me', protect, updateProfile);              // Update profile (optional feature)
router.put('/password', protect, updatePassword);       // Change password (optional feature)

module.exports = router;
