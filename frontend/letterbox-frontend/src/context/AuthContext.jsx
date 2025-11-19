// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

// Get user from localStorage or initialize null
const initialUser = JSON.parse(localStorage.getItem('user'));

// Set the timeout limit to 10 minutes (10 minutes * 60 seconds * 1000 milliseconds)
const TIMEOUT_LIMIT = 5 * 60 * 1000; 
let timeoutId; // Variable to hold the timer ID

export const AuthProvider = ({ children }) => {
    // State holds the user object (including the token)
    const [user, setUser] = useState(initialUser);
    const [loading, setLoading] = useState(false);
    
    // Check if the user is authenticated (token exists and hasn't expired, though we don't check expiration here)
    const isAuthenticated = !!user;

    // Function to handle login
    const login = async (userData) => {
        setLoading(true);
        try {
            const data = await authService.login(userData);
            setUser(data);
            return data;
        } catch (error) {
            // Re-throw the error for the component to catch and display
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to handle logout
    const logout = () => {
        // 1. Clear user from state and localStorage
        setUser(null);
        localStorage.removeItem('user');

        // 2. Clear any lingering timers
        clearTimeout(timeoutId);

        // 3. Redirect the user to the login page
        window.location.href = '/login';

        console.log("User logged out due to inactivity.");
    };

    const resetTimer = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(logout, TIMEOUT_LIMIT);
    };

    useEffect(() => {
        if (isAuthenticated) {
            // Events that will reset the timer
            const events = [
                'load',
                'mousemove',
                'mousedown',
                'click',
                'scroll',
                'keypress'
            ];

            // Add event listeners
            for (let i in events) {
                window.addEventListener(events[i], resetTimer);
            }

            // Set the initial timer
            resetTimer();

            // Cleanup function
            return () => {
                for (let i in events) {
                    window.removeEventListener(events[i], resetTimer);
                }
                clearTimeout(timeoutId);
            };
        }
    }, [isAuthenticated]);

    // Placeholder for register
    const register = (userData) => {
        // Implement later using authService.register
    };

    const updateProfile = async (userData) => {
        const data = await authService.updateProfile(userData);
        setUser(data);
        return data;
    };

    const updatePassword = async (userData) => {
        const data = await authService.updatePassword(userData);
        setUser(data);
        return data;
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        resetTimer,
        register,
        updateProfile,
        updatePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the context easily
export const useAuth = () => {
    return useContext(AuthContext);
};