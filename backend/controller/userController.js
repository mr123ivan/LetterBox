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

const updateProfile = async (req, res) => {
    const userId = req.user.id; // User ID is guaranteed by the 'protect' middleware
    const { userName, userEmail, currentPassword, newPassword } = req.body;

    try {
        // --- SCENARIO 1: PASSWORD CHANGE ---
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password.' });
            }
            
            // 1. Fetch user (to get the stored hash)
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' }); // Should not happen if middleware works
            }
            
            // 2. Verify current password against stored hash
            // NOTE: findById must be updated to return the userPassword hash for comparison.
            const isMatch = await User.comparePassword(currentPassword, user.userPassword); 
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password incorrect.' });
            }
            
            // 3. Update password in DB (model handles re-hashing)
            await User.updatePassword(userId, newPassword);
            
            // 4. Return success (must log out or re-issue token for security, but a message is simpler here)
            return res.status(200).json({ message: 'Password updated successfully. Please log in again.' });
        }
        
        // --- SCENARIO 2: DETAILS UPDATE (Name/Email) ---
        
        // 1. Fetch current user details
        const currentUser = await User.findById(userId); 
        
        // Use provided values or keep existing ones
        const updatedName = userName || currentUser.userName;
        const updatedEmail = userEmail || currentUser.userEmail;

        // 2. Check for email conflict (if email is changing)
        if (userEmail && userEmail !== currentUser.userEmail) {
            const userExists = await User.findByEmail(userEmail);
            if (userExists) {
                return res.status(400).json({ message: 'Email address is already in use.' });
            }
        }

        // 3. Update details
        await User.updateProfile(userId, updatedName, updatedEmail);
        
        // 4. Return the new user details (without password hash)
        return res.status(200).json({
            message: 'Profile updated successfully.',
            userId: userId,
            userName: updatedName,
            userEmail: updatedEmail,
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server error during profile update.' });
    }
};

const updatePassword = async (req, res) => {
    const { userId, userPassword } = req.body;

    if (!userId || !userPassword) {
        res.status(400).json({ message: 'Please enter all fields' });
        return;
    }

    try {
        const updated = await User.updatePassword(userId, userPassword);
        if (updated) {
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password update' });
    }
};

// --- Get All Users (for recipient dropdown) ---
const getAllUsers = async (req, res) => {
    try {
        // Get all users (will exclude password hashes)
        const users = await User.findAllUsers();
        
        // Return the list of users
        res.status(200).json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    updatePassword,
    getAllUsers
};