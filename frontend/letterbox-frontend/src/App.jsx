import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Home from './pages/Home';
import UserProfile from './pages/UserProfile';
import MyLetters from './pages/MyLetters';
import EditLetter from './pages/EditLetter';
import CreateLetter from './pages/CreateLetter';
import ViewLetter from './components/view-letter';
import ViewLetterReceived from './components/view-letter-received';
import NotificationPage from './pages/NotificationPage';
import TrashPage from './pages/TrashPage';


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

                {/* Protected Routes (Accessible only to logged-in users) */}
                <Route 
                    path="/home" 
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/profile" 
                    element={
                        <PrivateRoute>
                            <UserProfile />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/my-letters" 
                    element={
                        <PrivateRoute>
                            <MyLetters />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/edit/:id" 
                    element={
                        <PrivateRoute>
                            <EditLetter />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/compose" 
                    element={
                        <PrivateRoute>
                            <CreateLetter />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/letter/:id" 
                    element={
                        <PrivateRoute>
                            <ViewLetter />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/letter-received/:id" 
                    element={
                        <PrivateRoute>
                            <ViewLetterReceived />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/notifications" 
                    element={
                        <PrivateRoute>
                            <NotificationPage />
                        </PrivateRoute>
                    } 
                />
                
                <Route 
                    path="/trash" 
                    element={
                        <PrivateRoute>
                            <TrashPage />
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
