import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GoogleLoginButton = () => {
  const { login } = useAuth();
  const buttonRef = useRef(null);

  const handleCredentialResponse = async (response) => {
    try {
      // This endpoint is correct based on your userRoutes.js
      const res = await axios.post('/api/users/google', {
        credential: response.credential,
      });

      const data = res.data; // Expects { id, name, email, token }
      
      // This structure is correct for your AuthContext
      const userToLogin = {
        id: data.id,
        name: data.name,
        email: data.email,
        token: data.token,
      };

      login(userToLogin);
      localStorage.setItem('user', JSON.stringify(userToLogin));

    } catch (err) {
      console.error('Google login failed:', err);
      alert('Google login failed. Check the console for details.');
    }
  };

  useEffect(() => {
    if (window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 260,
      });
    }
  }, []);

  return (
    <div className="mt-4 flex justify-center">
      <div ref={buttonRef}></div>
    </div>
  );
};

export default GoogleLoginButton;