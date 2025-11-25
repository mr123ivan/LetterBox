import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from '../components/sidebar';
import openAiService from '../services/openAiService';

const CreateLetter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [letter, setLetter] = useState({
    letterTitle: '',
    letterContent: '',
    letterRecipient_id: null,
    is_public: false,
  });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [aiRewrite, setAiRewrite] = useState('');
  const [aiRewriteDisplay, setAiRewriteDisplay] = useState('');
  const [isTypingRewrite, setIsTypingRewrite] = useState(false);
  const [isRewriteApplied, setIsRewriteApplied] = useState(false);
  const [hasUsedAi, setHasUsedAi] = useState(false); // Track if AI was used

  //AI Chat
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatMessage, setAiChatMessage] = useState('');
  const [aiChatTone, setAiChatTone] = useState('sincere and warm');
  const [aiChatLength, setAiChatLength] = useState('medium');
  const [aiChatResult, setAiChatResult] = useState('');
  const [aiChatResultDisplay, setAiChatResultDisplay] = useState('');
  const [isTypingChat, setIsTypingChat] = useState(false);
  const [isChatApplied, setIsChatApplied] = useState(false);
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [aiChatError, setAiChatError] = useState('');

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Typewriter effect for AI Rewrite
  useEffect(() => {
    if (!aiRewrite) {
      setAiRewriteDisplay('');
      setIsTypingRewrite(false);
      return;
    }

    setIsTypingRewrite(true);
    setAiRewriteDisplay('');
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < aiRewrite.length) {
        setAiRewriteDisplay(aiRewrite.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingRewrite(false);
        clearInterval(typingInterval);
      }
    }, 5); // 20ms per character

    return () => clearInterval(typingInterval);
  }, [aiRewrite]);

  // Typewriter effect for AI Chat Result
  useEffect(() => {
    if (!aiChatResult) {
      setAiChatResultDisplay('');
      setIsTypingChat(false);
      return;
    }

    setIsTypingChat(true);
    setAiChatResultDisplay('');
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < aiChatResult.length) {
        setAiChatResultDisplay(aiChatResult.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingChat(false);
        clearInterval(typingInterval);
      }
    }, 5); // 20ms per character

    return () => clearInterval(typingInterval);
  }, [aiChatResult]);

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

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('recipient-dropdown');
      if (dropdown && !dropdown.contains(event.target) && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

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

      const response = await axios.post(
        '/api/letters/postletter',
        {
          letterTitle: letter.letterTitle,
          letterContent: letter.letterContent,
          letterRecipient_id: letter.letterRecipient_id || null,
          is_public: letter.is_public,
          is_ai_assisted: hasUsedAi
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      setSuccess('Letter created successfully!');
      
      // Redirect to My Letters after 2 seconds
      setTimeout(() => {
        navigate('/my-letters');
      }, 2000);

    } catch (err) {
      console.error('Failed to create letter:', err);
      setError(err.response?.data?.message || 'Failed to create letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };




const handleAiRewrite = async () => {
  setAiLoading(true);
  setAiError('');
  setAiRewrite('');
  setIsRewriteApplied(false);

  try {
    const data = await openAiService.rewriteLetter({
      letterContent: letter.letterContent,
      tone: 'romantic but respectful', // you can make this selectable later
    });
    setAiRewrite(data.rewritten || '');
  } catch (err) {
    console.error('AI rewrite error:', err);
    setAiError(err.response?.data?.message || 'Failed to rewrite letter.');
  } finally {
    setAiLoading(false);
  }
};

const handleUseAiRewrite = () => {
  if (!aiRewrite) return;
  // Use the full text, not the animated display
  setLetter(prev => ({
    ...prev,
    letterContent: aiRewrite,
  }));
  setIsRewriteApplied(true);
  setHasUsedAi(true); // Mark that AI was used
};

const handleRejectAiRewrite = () => {
  setAiRewrite('');
  setAiRewriteDisplay('');
  setIsRewriteApplied(false);
  setIsTypingRewrite(false);
};


const handleAiChatSubmit = async () => {
  setAiChatLoading(true);
  setAiChatError('');
  setAiChatResult('');
  setIsChatApplied(false);

  try {
    const data = await openAiService.chatLetter({
      message: aiChatMessage,
      tone: aiChatTone,
      length: aiChatLength,
    });
    setAiChatResult(data.letter || '');
  } catch (err) {
    console.error('AI chatLetter error:', err);
    setAiChatError(
      err.response?.data?.message || 'Failed to generate letter from AI.'
    );
  } finally {
    setAiChatLoading(false);
  }
};

const handleApplyAiChatLetter = () => {
  if (!aiChatResult) return;
  // Use the full text, not the animated display
  setLetter(prev => ({
    ...prev,
    letterContent: aiChatResult,
  }));
  setIsChatApplied(true);
  setHasUsedAi(true); // Mark that AI was used
};

const handleRejectAiChat = () => {
  setAiChatResult('');
  setAiChatResultDisplay('');
  setIsChatApplied(false);
  setIsTypingChat(false);
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
              Compose New Letter
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Write and send a letter to someone special
            </p>
          </div>

          {/* Error Message */}
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

          {/* Letter Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-6">
                {/* Letter Title */}
                <div>
                  <label htmlFor="letterTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Letter Title
                  </label>
                  <input
                    type="text"
                    id="letterTitle"
                    name="letterTitle"
                    value={letter.letterTitle}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    placeholder="Give your letter a title..."
                    required
                  />
                </div>

                {/* Letter Content */}
                <div>
                  <label htmlFor="letterContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Letter Content
                  </label>
                  <textarea
                    id="letterContent"
                    name="letterContent"
                    value={letter.letterContent}
                    onChange={handleChange}
                    rows="12"
                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
                    placeholder="Write your letter here..."
                    required
                  ></textarea>

                {/* AI Suggestion buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleAiRewrite}
                    disabled={aiLoading || !letter.letterContent}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {aiLoading ? 'Rewriting...' : 'Rewrite with AI'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiChat(!showAiChat)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    {showAiChat ? 'Hide Chat with AI' : 'Chat with AI'}
                  </button>
                </div>
                {/* end AI Suggestion buttons */}

                {/* AI Suggestion error message */}
                {aiError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{aiError}</p>
                )}

                {/* AI Suggestion */}
                {aiSuggestions && (
                  <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100">
                      AI Suggestions
                    </h3>
                    <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                      {aiSuggestions}
                    </p>
                  </div>
                )}
                {/* AI Suggestion rewritten version */}
                {aiRewrite && (
                  <div className="mt-4 p-3 rounded-lg border border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        AI Rewritten Version {isTypingRewrite && <span className="animate-pulse ml-1">✨</span>}
                      </h3>
                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={handleUseAiRewrite}
                          disabled={isTypingRewrite || isRewriteApplied}
                          className="text-xs px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {isRewriteApplied ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Applied
                            </>
                          ) : (
                            'Use this version'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleRejectAiRewrite}
                          disabled={isTypingRewrite}
                          className="text-xs px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Reject and clear"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                      {aiRewriteDisplay}
                      {isTypingRewrite && <span className="inline-block w-1 h-4 bg-blue-600 ml-1 animate-pulse"></span>}
                    </p>
                  </div>
                )}
                {/* end AI Suggestion rewritten version */}

      {/* Chat with AI to generate a letter */}
      {showAiChat && (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Chat with AI to Generate a Letter
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Describe the letter you want. AI will generate a complete draft you can apply to your content.
        </p>

        {/* User request */}
        <textarea
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          rows="4"
          placeholder="Example: I want a romantic apology letter to my girlfriend, 3 paragraphs, sincere but hopeful..."
          value={aiChatMessage}
          onChange={e => setAiChatMessage(e.target.value)}
        />

        {/* Tone + length controls */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tone
            </label>
            <select
              className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={aiChatTone}
              onChange={e => setAiChatTone(e.target.value)}
            >
              <option value="sincere and warm">Sincere & warm</option>
              <option value="romantic">Romantic</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="apologetic">Apologetic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Length
            </label>
            <select
              className="text-sm rounded-md border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={aiChatLength}
              onChange={e => setAiChatLength(e.target.value)}
            >
              <option value="short (1–2 paragraphs)">Short</option>
              <option value="medium (2–4 paragraphs)">Medium</option>
              <option value="long (4–6 paragraphs)">Long</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAiChatSubmit}
            className="self-end inline-flex items-center px-3 py-1.5 rounded-md text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={aiChatLoading || !aiChatMessage}
          >
            {aiChatLoading ? 'Generating…' : 'Ask AI to Write Letter'}
          </button>
        </div>

        {aiChatError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            {aiChatError}
          </p>
        )}

        {aiChatResult && (
          <div className="mt-4 p-3 rounded-lg border border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-gray-800">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                AI Generated Letter {isTypingChat && <span className="animate-pulse ml-1">✨</span>}
              </h3>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleApplyAiChatLetter}
                  disabled={isTypingChat || isChatApplied}
                  className="text-xs px-2 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isChatApplied ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Applied
                    </>
                  ) : (
                    'Apply to Letter Content'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleRejectAiChat}
                  disabled={isTypingChat}
                  className="text-xs px-2 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title="Reject and clear"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200">
              {aiChatResultDisplay}
              {isTypingChat && <span className="inline-block w-1 h-4 bg-purple-600 ml-1 animate-pulse"></span>}
            </p>
          </div>
        )}
      </div>
      )}

                </div>
                {/* end letter content section*/}

                {/* Letter Recipient with Search */}
                <div className="relative">
                  <label htmlFor="recipient-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient (Optional)
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <input
                      type="text"
                      id="recipient-search"
                      placeholder="Search recipients..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Recipient Dropdown */}
                  <div className="relative" id="recipient-dropdown">
                    <div className={`w-full rounded-lg border border-gray-300 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-700 ${!isDropdownOpen && 'hidden'}`}>
                      <ul className="max-h-60 overflow-auto py-1">
                        <li 
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => {
                            setLetter({...letter, letterRecipient_id: null});
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className="text-gray-900 dark:text-white">No recipient (private)</span>
                        </li>
                        
                        {users
                          .filter(user => user.userName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(user => (
                            <li 
                              key={user.userId} 
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                              onClick={() => {
                                setLetter({...letter, letterRecipient_id: user.userId});
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="text-gray-900 dark:text-white">{"(" + user.userId + ") " + user.userName}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Selected Recipient Display */}
                  <div 
                    className="mt-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-gray-900 dark:text-white">
                      {letter.letterRecipient_id ? 
                        users.find(u => u.userId === letter.letterRecipient_id)?.userName || `User ${letter.letterRecipient_id}` : 
                        'No recipient (private)'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Choosing a recipient will send this letter to their inbox
                  </p>
                </div>

                {/* Public Toggle Switch */}
                <div className="flex items-center justify-between pt-4">
                    <span className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Make Letter Public</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Public letters can be viewed by anyone.</span>
                    </span>
                    <label htmlFor="is_public" className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="is_public" 
                            className="sr-only peer" 
                            checked={letter.is_public}
                            onChange={() => setLetter(prev => ({ ...prev, is_public: !prev.is_public }))}
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${letter.is_public ? 'bg-green-600 dark:bg-green-700' : 'bg-red-500 dark:bg-red-700'}`}></div>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${letter.is_public ? 'left-[calc(100%-21px)]' : 'left-0.5'}`}></span>
                    </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/my-letters')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Letter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateLetter;