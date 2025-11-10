// backend/models/userModel.js
const db = require('../config/db'); // MySQL connection pool
const bcrypt = require('bcryptjs');

// --- Helper: Find User by Email ---
const findByEmail = async (userEmail) => {
    // The query returns an array containing [rows, fields]
    const [rows] = await db.execute('SELECT * FROM users WHERE userEmail = ?', [userEmail]);
    return rows[0]; // Return the first (and only) user object, or undefined
};

// --- Helper: Create a new User ---
const create = async (userName, userEmail, userPassword) => {
    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userPassword, salt);

    const [result] = await db.execute(
        'INSERT INTO users (userName, userEmail, userPassword) VALUES (?, ?, ?)',
        [userName, userEmail, passwordHash]
    );
    
    // Return the ID of the newly created user
    return result.insertId;
};

// --- Helper: Compare password with stored hash ---
const comparePassword = async (userPassword, hash) => {
    return await bcrypt.compare(userPassword, hash);
};

// --- Helper: Find User by ID ---
const findById = async (userId) => {
    const [rows] = await db.execute('SELECT userId, userName, userEmail FROM users WHERE userId = ?', [userId]);
    return rows[0]; // Returns user data without the hash
};


module.exports = {
    findByEmail,
    create,
    comparePassword,
    findById,
};