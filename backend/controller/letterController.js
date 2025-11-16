// backend/controller/letterController.js
const Letter = require('../models/letterModel');

// --- Helper function to simplify getting the user ID from the request ---
// Assuming req.user is populated by authMiddleware and has a 'userId' property
const getUserId = (req) => {
    // Make sure req.user exists
    if (!req.user) {
        throw new Error('User authentication required');
    }
    // Access userId from req.user (set by authMiddleware)
    return req.user.userId;
};

// @desc    Create a new letter
// @route   POST /api/letters
// @access  Private
const createLetter = async (req, res) => {
    // Note: The sender's ID (user_Id) is taken from the token (securely), 
    // NOT the request body.
    const senderId = getUserId(req);
    const {  letterTitle, letterContent, letterRecipient_id } = req.body;

    if (!letterTitle || !letterContent) {
        return res.status(400).json({ message: 'Title and content are required fields.' });
    }
    
    // We intentionally allow letterRecipient_id to be undefined/null

    try {
        const letterId = await Letter.createLetter(
            senderId, 
            letterRecipient_id,
            letterTitle, 
            letterContent
        );
        
        res.status(201).json({ 
            letterId, 
            message: 'Letter created successfully.',
            recipient: letterRecipient_id || 'None'
        });
    } catch (error) {
        console.error("Create Letter Error:", error);
        res.status(500).json({ message: 'Failed to create letter.' });
    }
};


// @desc    Get all user's letters (sent and drafts)
// @route   GET /api/letters
// @access  Private
const getLetters = async (req, res) => {
    const userId = getUserId(req);

    try {
        const letters = await Letter.findAllLetterByUser(userId);
        res.status(200).json(letters);
    } catch (error) {
        console.error("Get Letters Error:", error);
        res.status(500).json({ message: 'Failed to retrieve letters.' });
    }
};

// @desc    Get single letter by ID
// @route   GET /api/letters/:id
// @access  Private
const getLetterById = async (req, res) => {
    const letterId = req.params.id;
    const userId = getUserId(req);
    
    try {
        // Model ensures we only fetch the letter if it belongs to the user
        const letter = await Letter.findLetterByIdAndUser(letterId, userId);

        if (!letter) {
            return res.status(404).json({ message: 'Letter not found or access denied.' });
        }
        
        res.status(200).json(letter);
    } catch (error) {
        console.error("Get Single Letter Error:", error);
        res.status(500).json({ message: 'Failed to retrieve letter.' });
    }
};


// @desc    Update a specific letter
// @route   PUT /api/letters/:id
// @access  Private
const updateLetter = async (req, res) => {
    const { letterTitle, letterContent, letterRecipient_id } = req.body;
    const letterId = req.params.id;
    const userId = getUserId(req);

    if (!letterTitle || !letterContent) {
        return res.status(400).json({ message: 'Title and content are required for update.' });
    }

    try {
        // Allow letterRecipient_id to be null if not provided
        const finalRecipientId = letterRecipient_id || null;
        
        const affectedRows = await Letter.updateLetter(letterId, userId, letterTitle, letterContent, finalRecipientId);

        if (affectedRows === 0) {
             // 404 if the ID doesn't exist or doesn't belong to the user
            return res.status(404).json({ message: 'Letter not found or access denied.' });
        }
        
        res.status(200).json({ 
            message: 'Letter updated successfully.',
            recipient: letterRecipient_id ? `User ${letterRecipient_id}` : 'No recipient'
        });
    } catch (error) {
        console.error("Update Letter Error:", error);
        res.status(500).json({ message: 'Failed to update letter.' });
    }
};

// @desc    Delete a specific letter
// @route   DELETE /api/letters/:id
// @access  Private
const deleteLetter = async (req, res) => {
    const letterId = req.params.id;
    const userId = getUserId(req);

    try {
        const affectedRows = await Letter.deleteLetter(letterId, userId);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Letter not found or access denied.' });
        }

        res.status(200).json({ message: 'Letter deleted successfully.' });
    } catch (error) {
        console.error("Delete Letter Error:", error);
        res.status(500).json({ message: 'Failed to delete letter.' });
    }
};

const getAllReceivedLetters = async (req, res) => {
    const userId = getUserId(req);

    try {
        const letters = await Letter.findAllReceivedLetters(userId);
        
        if (letters.length === 0) {
            return res.status(200).json({ message: "You have no letters in your inbox." });
        }
        
        res.status(200).json(letters);
    } catch (error) {
        console.error("Get Received Letters Error:", error);
        res.status(500).json({ message: 'Failed to retrieve received letters.' });
    }
};


module.exports = {
    createLetter,
    getLetters,
    getLetterById, // Important to export this!
    updateLetter,
    deleteLetter,
    getAllReceivedLetters,
};