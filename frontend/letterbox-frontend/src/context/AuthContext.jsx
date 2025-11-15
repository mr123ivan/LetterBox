// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

// Get user from localStorage or initialize null
const initialUser = JSON.parse(localStorage.getItem('user'));

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
        authService.logout();
        setUser(null);
    };
    
    // Placeholder for register
    const register = (userData) => {
        // Implement later using authService.register
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the context easily
export const useAuth = () => {
    return useContext(AuthContext);
};