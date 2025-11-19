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
        'INSERT INTO users (userName, userEmail, userPassword, googleId) VALUES (?, ?, ?, ?)',
        [userName, userEmail, passwordHash, null]
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

// --- Update User Details (Name/Email) ---
const updateProfile = async (userId, userName, userEmail) => {
    // Only updates if the provided email isn't already used by another user (handled in controller logic)
    const [result] = await db.execute(
        'UPDATE users SET userName = ?, userEmail = ? WHERE userId = ?',
        [userName, userEmail, userId]
    );
    return result.affectedRows;
};

// --- Update Password (Requires Hashing) ---
const updatePassword = async (userId, newPassword) => {
    // 1. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // 2. Update the userPassword column
    const [result] = await db.execute(
        'UPDATE users SET userPassword = ? WHERE userId = ?',
        [newPasswordHash, userId]
    );
    return result.affectedRows;
};

// --- Get All Users (Basic Info Only) ---
const findAllUsers = async () => {
    // Returns basic info about all users (no password)
    const [rows] = await db.execute('SELECT userId, userName, userEmail FROM users ORDER BY userName');
    return rows;
};


// --- Helper: Create a new User from Google login (no password) ---
const createFromGoogle = async ({ userName, userEmail, googleId }) => {
    // You may want to add a googleId column to your users table, but
    // if you don't have one yet, you can just ignore it or store null.
    const [result] = await db.execute(
        'INSERT INTO users (userName, userEmail, userPassword) VALUES (?, ?, ?)',
        [userName, userEmail, null] // or a random string if userPassword is NOT NULL
    );

    return result.insertId;
};

module.exports = {
    findByEmail,
    create,
    comparePassword,
    findById,
    updateProfile,
    updatePassword,
    findAllUsers,
    createFromGoogle
};