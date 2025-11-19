// src/services/authService.js
import axios from 'axios';

// Use the Vite proxy: '/api' will be forwarded to 'http://localhost:5000/api'
const API_URL = '/api/users/'; 

// Note: Your backend expects 'userEmail' and 'userPassword', NOT 'email' and 'password'.
// We ensure we send the correct keys here.

// --- Login User ---
const login = async (userData) => {
    // 🚨 IMPORTANT: Map frontend fields (email, password) to backend fields (userEmail, userPassword)
    const response = await axios.post(API_URL + 'login', {
        userEmail: userData.email,      // Backend expects userEmail
        userPassword: userData.password// Backend expects userPassword
    });

    // Your backend sends userId, userName, userEmail, and token on success.
    if (response.data.token) {
        // Save the entire data object to localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// --- Logout User ---
const logout = () => {
    localStorage.removeItem('user');
};

const updateProfile = async (userData) => {
    const response = await axios.put(API_URL + 'profile', userData);
    return response.data;
};

const updatePassword = async (userData) => {
    const response = await axios.put(API_URL + 'password', userData);
    return response.data;
};

// --- Register User ---
const register = async (formData) => {
    // Maps frontend fields (fullName, email, password) to backend fields (userName, userEmail, userPassword)
    const response = await axios.post(API_URL + 'register', {
        userName: formData.username,
        userEmail: formData.email
    });

    // Automatically log user in by saving token after successful registration
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};


const authService = {
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
};

export default authService;