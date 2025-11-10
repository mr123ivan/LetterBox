// backend/controller/userController.js (Start with this helper function)
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
};

// --- Register User ---
// Will handle: POST /api/users/register
const registerUser = async (req, res) => {
    const { userName, userEmail, userPassword } = req.body;

    if (!userName || !userEmail || !userPassword) {
        res.status(400).json({ message: 'Please enter all fields' });
        return;
    }

    try {
        // 1. Check if user already exists
        const userExists = await User.findByEmail(userEmail);
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // 2. Create the user
        const userId = await User.create(userName, userEmail, userPassword);

        // 3. Send success response with token
        res.status(201).json({
            id: userId,
            name: userName,
            email: userEmail,
            token: generateToken(userId),
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// --- Login User ---
// Will handle: POST /api/users/login
const loginUser = async (req, res) => {
    const { userEmail, userPassword } = req.body;

    if (!userEmail || !userPassword) {
        res.status(400).json({ message: 'Please enter email and password' });
        return;
    }

    try {
        // 1. Find user by email (gets the user object including the hash)
        const user = await User.findByEmail(userEmail);

        // 2. Check user and compare password
        if (user && (await User.comparePassword(userPassword, user.userPassword))) {
            res.json({
                id: user.userId,
                name: user.userName,
                email: user.userEmail,
                token: generateToken(user.userId),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    generateToken, // Exported for potential use in the model later
};