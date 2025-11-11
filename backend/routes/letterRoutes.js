// backend/Routes/letterRoutes.js
const express = require('express');
const router = express.Router();

// Import the middleware
const { protect } = require('../middleware/authMiddleware');

// Import all controller functions
const { 
    createLetter, 
    getLetters, 
    getLetterById, // Added for fetching a specific letter
    updateLetter, 
    deleteLetter 
} = require('../controller/letterController');

// All routes defined here will require a valid JWT via the 'protect' middleware.

// --- /api/letters ---
router.route('/getall').get(protect, getLetters); 

// POST /api/letters: Create a new letter (draft or sent)
router.route('/postletter').post(protect, createLetter); 

// --- /api/letters/:id ---
router.route('/getid').get(protect, getLetterById);
router.route('/putid').put(protect, updateLetter);
router.route('/deleteid').delete(protect, deleteLetter); 

module.exports = router;