import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/SideBar';

const MyLetters = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [recipients, setRecipients] = useState({}); // 'all' or 'received'

  useEffect(() => {
    fetchLetters(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    if (letters.length > 0) {
      fetchRecipientNames();
    }
  }, [letters]);

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    setRecipients({});
  };

  const fetchRecipientNames = async () => {
    if (!letters.length || !user?.token) return;

    try {
      const userIds = [...new Set([
        ...letters
          .filter(letter => letter.letterRecipient_id)
          .map(letter => letter.letterRecipient_id),
        ...letters
          .filter(letter => letter.sender_id)
          .map(letter => letter.sender_id)
      ])];

      if (userIds.length === 0) return;

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const userMap = {};
      response.data.forEach(user => {
        userMap[user.userId] = user.userName;
      });

      setRecipients(userMap);
    } catch (err) {
      console.error('Failed to fetch user names:', err);
    }
  };

  const fetchLetters = async (tab) => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!user || !user.token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    const endpoint = tab === 'all' ? '/api/letters/getall' : '/api/letters/getallreceived';

    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.data.message && response.data.message.includes('no letters')) {
        setLetters([]);
      } else {
        // Filter out trashed and permanently deleted letters if viewing received letters
        let filteredLetters = response.data;
        if (tab === 'received') {
          const trashedIds = JSON.parse(localStorage.getItem('trashedLetters') || '[]');
          const permanentlyDeletedIds = JSON.parse(localStorage.getItem('permanentlyDeletedLetters') || '[]');
          filteredLetters = response.data.filter(letter => 
            !trashedIds.includes(letter.letterId.toString()) &&
            !permanentlyDeletedIds.includes(letter.letterId.toString())
          );
        }
        setLetters(filteredLetters);
      }
    } catch (err) {
      console.error('Failed to fetch letters:', err);
      setError('Failed to load letters. Please try again later.');
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLetter = async (letterId) => {
    if (!window.confirm('Are you sure you want to delete this letter?')) {
      return;
    }

    try {
      setLoading(true);

      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(`/api/letters/deleteid/${letterId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (response.status === 200) {
        setLetters(letters.filter(letter => letter.letterId !== letterId));
        setSuccess('Letter deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete letter:', err);
      setError(err.response?.data?.message || 'Failed to delete letter. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    
    // For names with spaces, take first letter of each word
    if (name.includes(' ')) {
      return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2); // Limit to 2 characters
    }
    
    // For single names, take first 1-2 characters
    return name.charAt(0).toUpperCase() + (name.length > 1 ? name.charAt(1) : '');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SideBar className="sticky top-0 z-10" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              My Letters
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage all your letters
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${selectedTab === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => handleTabChange('all')}
            >
              My Letters
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${selectedTab === 'received' 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => handleTabChange('received')}
            >
              Received Letters
            </button>
          </div>

          {/* New Letter Button */}
          <div className="mb-6">
            <Link 
              to="/compose"
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:border-blue-800 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Compose New Letter
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading letters...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && letters.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                No letters found
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {selectedTab === 'all' 
                  ? 'You haven\'t written any letters yet. Click "Compose New Letter" to get started.'
                  : 'You haven\'t received any letters yet.'}
              </p>
            </div>
          )}

          {/* Letters List */}
          {!loading && !error && letters.length > 0 && (
            <div className="space-y-4">
              {letters.map((letter) => (
                <div 
                  key={letter.letterId} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row"
                >
                  {/* Letter Content Preview */}
                  <div className="flex-1 p-6">
                    <div className="flex items-center mb-3">
                      {selectedTab === 'received' ? (
                        // For received letters, show sender's info
                        <>
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                            {getInitials(recipients[letter.sender_id] || 'U')}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              From: {letter.sender_id ? 
                                (recipients[letter.sender_id] || `User ${letter.sender_id}`) : 
                                'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Received: {formatDate(letter.created_at)}</p>
                          </div>
                        </>
                      ) : (
                        // For sent letters, show recipient's info if available
                        <>
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                            {letter.letterRecipient_id ? getInitials(recipients[letter.letterRecipient_id] || 'R') : 'N'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              To: {letter.letterRecipient_id ? 
                                (recipients[letter.letterRecipient_id] || `User ${letter.letterRecipient_id}`) : 
                                'No recipient'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Created: {formatDate(letter.created_at)}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {letter.letterTitle}
                    </h3>

                     {!!letter.is_ai_assisted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white" title="This letter was created or assisted by AI">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                          </svg>
                          AI Assisted
                        </span>
                      )}
                    
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {letter.letterContent}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="bg-gray-50 dark:bg-gray-700 md:w-48 flex md:flex-col justify-end p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-600">
                    <Link
                      to={selectedTab === 'received' ? `/letter-received/${letter.letterId}` : `/letter/${letter.letterId}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full mb-2"
                    >
                      Read Full Letter
                    </Link>
                    
                    {selectedTab === 'all' && (
                      <>
                        <Link
                          to={`/edit/${letter.letterId}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full mb-2"
                        >
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteLetter(letter.letterId)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 dark:text-red-200 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full"
                        >
                          Delete
                        </button>
                      </>
                    )}
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

export default MyLetters;