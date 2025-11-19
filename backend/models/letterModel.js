// backend/models/Letter.js
const db = require('../config/db'); // Your MySQL connection 

// --- CREATE Letter ---
const createLetter = async (user_Id, letterRecipient_id, letterTitle, letterContent, is_public) => {

    const finalRecipientId = letterRecipient_id || null;

    // Note the user_id field in the SQL matches your letters table schema.
    const [result] = await db.execute(
        'INSERT INTO letters (letterTitle, letterContent, user_id, letterRecipient_id, is_public) VALUES (?, ?, ?, ?, ?)',
        [letterTitle, letterContent, user_Id, finalRecipientId, is_public]
    );
    return result.insertId;
};

// --- READ All Letters by User ---
const findAllLetterByUser = async (user_Id) => {
    // Selects letters created by this user or addressed to this user
    const [rows] = await db.execute(
        'SELECT letterId, letterTitle, letterContent, created_at, letterRecipient_id FROM letters WHERE user_id = ? ORDER BY created_at DESC',
        [user_Id]
    );
    return rows;
};

// --- READ Single Letter by ID and User --- USED
const findLetterByIdAndUser = async (letterId, user_Id) => {
    // Ensures the letter ID exists AND user is either the sender OR recipient
    const [rows] = await db.execute(
        'SELECT letterId, letterTitle, letterContent, created_at, letterRecipient_id, user_id as sender_id FROM letters WHERE letterId = ? AND (user_id = ? OR letterRecipient_id = ?)',
        [letterId, user_Id, user_Id]
    );
    return rows[0];
};

// --- UPDATE Letter ---
const updateLetter = async (letterId, user_Id, letterTitle, letterContent, letterRecipient_id, is_public) => {
    // Updates only the letter that matches BOTH the ID and the user ID
    const [result] = await db.execute(
        'UPDATE letters SET letterTitle = ?, letterContent = ?, letterRecipient_id = ?, is_public = ? WHERE letterId = ? AND user_id = ?',
        [letterTitle, letterContent, letterRecipient_id, is_public, letterId, user_Id]
    );
    return result.affectedRows; // Returns 1 if updated, 0 if not found/no change
};

// --- DELETE Letter ---
const deleteLetter = async (letterId, user_Id) => {
    // Deletes only the letter that matches BOTH the ID and the user ID
    const [result] = await db.execute(
        'DELETE FROM letters WHERE letterId = ? AND user_id = ?',
        [letterId, user_Id]
    );
    return result.affectedRows; // Returns 1 if deleted, 0 otherwise
};


// --- READ All Letters SENT TO User ---
const findAllReceivedLetters = async (userId) => {
    // Selects letters where the recipient ID matches the logged-in user's ID.
    const [rows] = await db.execute(
        `SELECT 
            letterId, letterTitle, letterContent, created_at, user_id AS sender_id 
         FROM letters 
         WHERE letterRecipient_id = ? 
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

const getAllPublicLetters = async () => {
    const [rows] = await db.execute(
        `SELECT letterId, letterTitle, letterContent, created_at, user_id AS sender_id 
         FROM letters 
         WHERE is_public = true
         ORDER BY created_at DESC`
    );
    return rows;
};

module.exports = {
    createLetter,
    findAllLetterByUser,
    findLetterByIdAndUser,
    updateLetter,
    deleteLetter,
    findAllReceivedLetters,
    getAllPublicLetters
};