import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/sidebar';

const TrashPage = () => {
  const { user } = useAuth();
  const [trashedLetters, setTrashedLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [senderNames, setSenderNames] = useState({});

  useEffect(() => {
    fetchTrashedLetters();
  }, []);

  const fetchTrashedLetters = async () => {
    setLoading(true);
    setError('');

    try {
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // Get trashed letter IDs from localStorage
      const trashedIds = JSON.parse(localStorage.getItem('trashedLetters') || '[]');
      
      // Get permanently deleted letter IDs from localStorage
      const permanentlyDeletedIds = JSON.parse(localStorage.getItem('permanentlyDeletedLetters') || '[]');

      if (trashedIds.length === 0) {
        setTrashedLetters([]);
        setLoading(false);
        return;
      }

      // Fetch all received letters
      const response = await axios.get('/api/letters/getallreceived', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Filter to only show trashed letters that haven't been permanently deleted
      const trashed = response.data.filter(letter => 
        trashedIds.includes(letter.letterId.toString()) && 
        !permanentlyDeletedIds.includes(letter.letterId.toString())
      );
      setTrashedLetters(trashed);

      // Fetch sender names
      if (trashed.length > 0) {
        fetchSenderNames(trashed);
      }
    } catch (err) {
      console.error('Failed to fetch trashed letters:', err);
      setError('Failed to load trashed letters. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSenderNames = async (letters) => {
    try {
      if (!user || !user.token) return;

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const userMap = {};
      response.data.forEach(u => {
        userMap[u.userId] = u.userName;
      });

      setSenderNames(userMap);
    } catch (err) {
      console.error('Failed to fetch sender names:', err);
    }
  };

  const handleRestore = (letterId) => {
    try {
      // Get current trashed letters
      const trashedIds = JSON.parse(localStorage.getItem('trashedLetters') || '[]');
      
      // Remove this letter from trash
      const updated = trashedIds.filter(id => id !== letterId.toString());
      localStorage.setItem('trashedLetters', JSON.stringify(updated));

      // Update UI
      setTrashedLetters(prev => prev.filter(letter => letter.letterId !== letterId));
      setSuccess('Letter restored successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to restore letter:', err);
      setError('Failed to restore letter. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeletePermanently = (letterId) => {
    if (!window.confirm('Are you sure you want to permanently delete this letter? It will remain in the sender\'s records but will be permanently hidden from your account.')) {
      return;
    }

    try {
      // Add to permanently deleted list (soft delete)
      const permanentlyDeletedIds = JSON.parse(localStorage.getItem('permanentlyDeletedLetters') || '[]');
      if (!permanentlyDeletedIds.includes(letterId.toString())) {
        permanentlyDeletedIds.push(letterId.toString());
        localStorage.setItem('permanentlyDeletedLetters', JSON.stringify(permanentlyDeletedIds));
      }
      
      // Update UI
      setTrashedLetters(prev => prev.filter(letter => letter.letterId !== letterId));
      setSuccess('Letter permanently deleted from your account!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to delete letter:', err);
      setError('Failed to delete letter. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEmptyTrash = () => {
    if (!window.confirm('Are you sure you want to permanently delete all trashed letters? They will remain in the sender\'s records but will be permanently hidden from your account.')) {
      return;
    }

    try {
      // Add all trashed letters to permanently deleted list
      const permanentlyDeletedIds = JSON.parse(localStorage.getItem('permanentlyDeletedLetters') || '[]');
      
      trashedLetters.forEach(letter => {
        if (!permanentlyDeletedIds.includes(letter.letterId.toString())) {
          permanentlyDeletedIds.push(letter.letterId.toString());
        }
      });
      
      localStorage.setItem('permanentlyDeletedLetters', JSON.stringify(permanentlyDeletedIds));
      
      // Update UI
      setTrashedLetters([]);
      setSuccess('All trashed letters permanently deleted from your account!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to empty trash:', err);
      setError('Failed to empty trash. Please try again.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar className="sticky top-0 z-10" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Trash
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {trashedLetters.length > 0 
                    ? `${trashedLetters.length} letter${trashedLetters.length > 1 ? 's' : ''} in trash`
                    : 'Trash is empty'}
                </p>
              </div>
              
              {trashedLetters.length > 0 && (
                <button
                  onClick={handleEmptyTrash}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Empty Trash
                </button>
              )}
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
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
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading trashed letters...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && trashedLetters.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Trash is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Letters you move to trash will appear here
              </p>
            </div>
          )}

          {/* Trashed Letters Grid */}
          {!loading && trashedLetters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashedLetters.map((letter) => (
                <div
                  key={letter.letterId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-5">
                    {/* Sender Info */}
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold">
                        {getInitials(senderNames[letter.sender_id] || 'U')}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          From: {senderNames[letter.sender_id] || `User ${letter.sender_id}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(letter.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Letter Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {letter.letterTitle}
                    </h3>

                    {/* Letter Preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {letter.letterContent}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRestore(letter.letterId)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeletePermanently(letter.letterId)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrashPage;
