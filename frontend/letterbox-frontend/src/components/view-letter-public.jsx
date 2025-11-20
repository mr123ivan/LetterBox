import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewLetterPublic = ({ letterId, isOpen, onClose }) => {
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen && letterId) {
      fetchLetter();
    }
  }, [isOpen, letterId]);
  
  const fetchLetter = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`/api/letters/publicletters/${letterId}`);
      setLetter(response.data);
    } catch (err) {
      console.error('Failed to fetch public letter:', err);
      setError('Failed to load the letter. It might not exist or is not public.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-16">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Loading letter...</span>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
            </div>
          )}
          
          {/* Letter Display */}
          {!loading && !error && letter && (
            <>
              {/* Letter Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {letter.letterTitle}
                </h1>
                
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {letter.sender_userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Written by {letter.sender_userName || `User ${letter.sender_id}`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Published on {formatDate(letter.created_at)}
                    </p>
                       {/* AI Assisted label*/}
                {!!letter.is_ai_assisted && (
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white" title="This letter was created or assisted by AI">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                      </svg>
                      AI Assisted
                  </span>
                  )}
                  </div>
                </div>
              </div>
              
              {/* Letter Content */}
              <div className="p-6 md:p-8">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                    {letter.letterContent}
                  </p>
                </div>
              </div>
              
              {/* Letter Footer */}
              {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 flex justify-between items-center">
                <button 
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                

              </div> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLetterPublic;