import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/SideBar';

const EditLetter = () => {
  const { id } = useParams(); // Get letter ID from URL
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [letter, setLetter] = useState({
    letterTitle: '',
    letterContent: '',
    letterRecipient_id: null,
  });
  const [users, setUsers] = useState([]);

  // Fetch letter and users on component mount
  useEffect(() => {
    fetchLetter();
    fetchUsers();
  }, []);

  const fetchLetter = async () => {
    setLoading(true);
    setError('');

    try {
      // Make sure we have the token
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`/api/letters/getid/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setLetter({
        letterTitle: response.data.letterTitle,
        letterContent: response.data.letterContent,
        letterRecipient_id: response.data.letterRecipient_id || null,
      });
    } catch (err) {
      console.error('Failed to fetch letter:', err);
      setError(err.response?.data?.message || 'Failed to fetch letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Make sure we have the token
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Don't set error state for users - it's not critical
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLetter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Make sure we have the token
      if (!user || !user.token) {
        throw new Error('Authentication required');
      }

      // Validate form
      if (!letter.letterTitle || !letter.letterContent) {
        throw new Error('Title and content are required');
      }

      // Save letter
      const response = await axios.put(
        `/api/letters/putid/${id}`, 
        letter,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      
      setSuccess('Letter updated successfully!');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/my-letters');
      }, 1500);
      
    } catch (err) {
      console.error('Failed to update letter:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SideBar className="sticky top-0 z-10" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Edit Letter
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Update your letter details below
              </p>
            </div>
            <Link 
              to="/my-letters"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
          </div>

          {/* Loading State */}
          {loading && !letter.letterTitle && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading letter...</span>
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

          {/* Edit Form */}
          {!loading && letter.letterTitle && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Letter Title */}
                <div>
                  <label htmlFor="letterTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="letterTitle"
                    name="letterTitle"
                    value={letter.letterTitle}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    required
                  />
                </div>

                {/* Letter Content */}
                <div>
                  <label htmlFor="letterContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    id="letterContent"
                    name="letterContent"
                    value={letter.letterContent}
                    onChange={handleChange}
                    rows="12"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    required
                  ></textarea>
                </div>

                {/* Letter Recipient */}
                <div>
                  <label htmlFor="letterRecipient_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient (Optional)
                  </label>
                  <select
                    id="letterRecipient_id"
                    name="letterRecipient_id"
                    value={letter.letterRecipient_id || ''}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                  >
                    <option value="">No recipient (private)</option>
                    {users.map(user => (
                      <option key={user.userId} value={user.userId}>
                        {user.userName} ({user.userEmail})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Choosing a recipient will send this letter to their inbox
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditLetter;
