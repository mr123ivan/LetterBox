import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Home from './pages/Home';

// --- 1. Private Route Component ---
// Component that wraps protected routes (like the Dashboard)
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // If the user is NOT authenticated, send them to the login page
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* Public Routes (Accessible to everyone) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Route (Accessible only to logged-in users) */}
                <Route 
                    path="/home" 
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } 
                />
                
                {/* Default Route: Redirects to Home (if logged in) or Login (if not) */}
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                             <Navigate to="/home" replace />
                        </PrivateRoute>
                    } 
                />
                
                {/* Fallback for unknown URLs */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
