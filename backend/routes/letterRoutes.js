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
    deleteLetter,
    getAllReceivedLetters 
} = require('../controller/letterController');

// All routes defined here will require a valid JWT via the 'protect' middleware.

// --- Read All Letters ---
router.route('/getall').get(protect, getLetters); 

// --- Create a New Letter ---
router.route('/postletter').post(protect, createLetter); 

// --- Read Update Delete ---
router.route('/getid/:id').get(protect,getLetterById);
router.route('/putid/:id').put(protect,updateLetter);
router.route('/deleteid/:id').delete(protect,deleteLetter); 

// --- Read All Letters That You Received ---
router.route('/getallreceived').get(protect, getAllReceivedLetters);

module.exports = router;