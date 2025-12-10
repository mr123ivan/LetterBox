import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SideBar from './sidebar';

const ViewLetterReceived = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [senderName, setSenderName] = useState('');
  const letterContentRef = useRef(null);

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
      
      // Fetch sender name
      if (response.data.sender_id) {
        fetchSenderName(response.data.sender_id);
      }
    } catch (err) {
      console.error('Failed to fetch letter:', err);
      setError(err.response?.data?.message || 'Failed to load letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSenderName = async (senderId) => {
    try {
      if (!user || !user.token) return;

      const response = await axios.get('/api/users/getusers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      const sender = response.data.find(u => u.userId === senderId);
      if (sender) setSenderName(sender.userName);
    } catch (err) {
      console.error('Failed to fetch sender name:', err);
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

  const handleDownloadPdf = () => {
    const input = letterContentRef.current;
    if (!input) return;

    // Temporarily hide action buttons so they don't appear in the PDF
    const buttons = input.querySelectorAll('.action-buttons');
    buttons.forEach(btn => btn.style.display = 'none');

    html2canvas(input, { 
      scale: 2, // Higher scale for better resolution
      useCORS: true
    }).then(canvas => {
      // Show buttons again after capture
      buttons.forEach(btn => btn.style.display = 'flex');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`letter-${letter.letterId}.pdf`);
    }).catch(err => {
      console.error("Could not generate PDF", err);
      setError('Could not generate PDF. Please try again.');
      // Ensure buttons are visible even if there's an error
      buttons.forEach(btn => btn.style.display = 'flex');
    });
  };

  const handleMoveToTrash = () => {
    if (!window.confirm('Move this letter to trash?')) {
      return;
    }

    try {
      // Get current trashed letters from localStorage
      const trashedLetters = JSON.parse(localStorage.getItem('trashedLetters') || '[]');
      
      // Add this letter ID to trashed list if not already there
      if (!trashedLetters.includes(id)) {
        trashedLetters.push(id);
        localStorage.setItem('trashedLetters', JSON.stringify(trashedLetters));
      }

      // Redirect back to where they came from
      const backPath = location.state?.from || '/my-letters';
      navigate(backPath);
    } catch (err) {
      console.error('Failed to move to trash:', err);
      setError('Failed to move letter to trash. Please try again.');
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
              to="/my-letters"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to My Letters
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
  const backText = location.state?.from === '/notifications' ? 'Back to Notifications' : 'Back to My Letters';

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
          <div ref={letterContentRef}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Letter Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-lg">
                    {getInitials(senderName || 'S')}
                  </div>
                  
                  {/* Sender Info */}
                  <div>
                    <p className="text-white text-sm font-medium">From:</p>
                    <p className="text-white text-lg font-semibold">
                      {senderName || `User ${letter.sender_id}`}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 action-buttons">
                  <button
                    onClick={handleMoveToTrash}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Move to Trash
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              {/* Letter Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {letter.letterTitle}
              </h1>

              {/* AI Assisted label*/}
              {!!letter.is_ai_assisted && (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white" title="This letter was created or assisted by AI">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    AI Assisted
                </span>
                )}

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
                  <span>Letter ID: {letter.letterId}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewLetterReceived;
