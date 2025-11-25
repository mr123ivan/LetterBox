import React, { useState, useEffect } from 'react';
import SideBar from '../components/sidebar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ViewLetterPublic from '../components/view-letter-public';

const Home = () => {
  const { user } = useAuth();
  const [publicLetters, setPublicLetters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLetterId, setSelectedLetterId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchPublicLetters = async () => {
    setLoading(true);
    setError('');

    // Create a promise that resolves after 5 seconds
    const delay = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Start the API call
      const apiCall = axios.get('/api/letters/publicletters');

      // Wait for both the API call and the 5-second delay to complete
      const [response] = await Promise.all([apiCall, delay]);

      setPublicLetters(response.data);
    } catch (err) {
      console.error('Failed to fetch public letters:', err);
      if (err.response && err.response.status === 404) {
        setPublicLetters([]);
      } else {
        setError('Failed to load the feed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicLetters();
  }, []);

  const filteredLetters = publicLetters.filter(letter => {
    const query = searchQuery.toLowerCase();
    return (
      letter.letterTitle.toLowerCase().includes(query) ||
      letter.letterContent.toLowerCase().includes(query) ||
      (letter.sender_userName && letter.sender_userName.toLowerCase().includes(query)) ||
      formatDate(letter.created_at).toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SideBar className="sticky top-0 z-10" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto"> {/* Wider container */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Public Letters Feed
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Someone might have a letter for you!
              </p>
            </div>
            <button 
              onClick={fetchPublicLetters}
              disabled={loading}
              className="px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200"
              title="Refresh feed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M19 19v-5h-5M19 4h-5v5M4 19h5v-5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.828-7.172l-1.415 1.415M7.586 17.828l-1.415 1.415M16.243 17.243l1.414 1.414M7.757 6.757L6.343 5.343" />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search by title, content, author, or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Initial Loading State (only when letters are not yet loaded) */}
          {loading && publicLetters.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading public feed...</span>
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
          
          {/* Empty State / No Search Results */}
          {!loading && !error && filteredLetters.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {searchQuery ? 'No letters match your search' : 'No public letters found'}
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try searching for something else.' : 'Be the first to share a letter with the world!'}
              </p>
            </div>
          )}

          {/* Content Area: Refresh indicator + Letters Grid */}
          {!error && publicLetters.length > 0 && (
            <div>
              {/* Refreshing Indicator (only shows on refresh, not initial load) */}
              {loading && publicLetters.length > 0 && (
                <div className="flex justify-center py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing feed...</span>
                  </div>
                </div>
              )}

              {/* Letters Grid - 5 cards per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredLetters.map((letter) => (
                  <div 
                    key={letter.letterId} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full"
                  >
                    {/* Letter Content Preview */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                          {getInitials(letter.sender_userName || 'User')}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {letter.sender_userName || `User ${letter.sender_id}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(letter.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
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
                      
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
                        {letter.letterContent}
                      </p>
                    </div>
                    
                    {/* Action Button */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          setSelectedLetterId(letter.letterId);
                          setIsModalOpen(true);
                        }}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Read Full Letter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal for viewing full letter */}
        <ViewLetterPublic 
          letterId={selectedLetterId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default Home;