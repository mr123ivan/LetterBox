// backend/Routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controller/userController');
const router = express.Router();

// Define public routes for user authentication
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;