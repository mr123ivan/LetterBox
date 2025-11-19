// backend/Routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser, updateProfile, updatePassword, getAllUsers, googleLogin } = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Define public routes for user authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// Define protected routes for user profile
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Route to get all users for letter recipient dropdown
router.get('/getusers', protect, getAllUsers);

module.exports = router;