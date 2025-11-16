import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from './SideBar';

const ViewLetter = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');

  useEffect(() => {
    fetchLetter();
  }, [id]);

  const fetchLetter = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`/api/letters/getid/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setLetter(response.data);
      
      // Fetch user names if there's a sender or recipient
      if (response.data.sender_id || response.data.letterRecipient_id) {
        fetchUserNames(response.data.sender_id, response.data.letterRecipient_id);
      }
    } catch (err) {
      console.error('Failed to fetch letter:', err);
      setError(err.response?.data?.message || 'Failed to load letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNames = async (senderId, recipientId) => {
    try {
      if (!user || !user.token) return;

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const users = response.data;
      
      if (senderId) {
        const sender = users.find(u => u.userId === senderId);
        if (sender) setSenderName(sender.userName);
      }
      
      if (recipientId) {
        const recipient = users.find(u => u.userId === recipientId);
        if (recipient) setRecipientName(recipient.userName);
      }
    } catch (err) {
      console.error('Failed to fetch user names:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    
    if (name.includes(' ')) {
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    }
    
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1) : '');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this letter?')) {
      return;
    }

    try {
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`/api/letters/deleteid/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Redirect to My Letters after successful deletion
      navigate('/my-letters');
    } catch (err) {
      console.error('Failed to delete letter:', err);
      setError(err.response?.data?.message || 'Failed to delete letter. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <SideBar className="sticky top-0 z-10" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300 text-lg">Loading letter...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const backPath = location.state?.from || '/my-letters';
    const backText = location.state?.from === '/notifications' ? 'Back to Notifications' : 'Back to My Letters';
    
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <SideBar className="sticky top-0 z-10" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
            <Link
              to={backPath}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {backText}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!letter) {
    return null;
  }

  const backPath = location.state?.from || '/my-letters';
  const backText = 'Back to My Letters';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar className="sticky top-0 z-10" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to={backPath}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {backText}
            </Link>
          </div>

          {/* Letter Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Letter Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-lg">
                    {getInitials(recipientName || 'R')}
                  </div>
                  
                  {/* Recipient Info */}
                  <div>
                    <p className="text-white text-sm font-medium">To:</p>
                    <p className="text-white text-lg font-semibold">
                      {recipientName || (letter.letterRecipient_id ? `User ${letter.letterRecipient_id}` : 'Private Letter')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Edit and Delete */}
                <div className="flex space-x-2">
                  <Link
                    to={`/edit/${letter.letterId}`}
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>

              {/* Letter Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {letter.letterTitle}
              </h1>

              {/* Date */}
              <p className="text-blue-100 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {formatDate(letter.created_at)}
              </p>
            </div>

            {/* Letter Content */}
            <div className="px-6 py-8">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {letter.letterContent}
                </div>
              </div>
            </div>

            {/* Letter Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Letter ID: {letter.letterId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewLetter;
