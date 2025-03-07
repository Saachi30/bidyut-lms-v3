import React, { useState } from 'react';
import { X, QrCode } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const JoinQuizModal = ({ onClose }) => {
  const [quizCode, setQuizCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinQuiz = async () => {
    // Validate quiz code input
    if (!quizCode.trim()) {
      toast.error('Please enter a valid quiz code');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/quizzes/code/${quizCode.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Navigate to the quiz page after successful code verification
      onClose();
      window.location.href = `/lms/quiz/${response.data.data.id}`;
    } catch (err) {
      // Handle specific error scenarios
      if (err.response) {
        switch (err.response.status) {
          case 404:
            toast.error('Invalid quiz code. Please check and try again.');
            break;
          case 403:
            toast.error('Only students can join this quiz.');
            break;
          case 400:
            toast.error('Quiz code has expired.');
            break;
          default:
            toast.error(err.response?.data?.message || 'Failed to join quiz');
        }
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeScan = () => {
    // Placeholder for future QR code scanning functionality
    toast.info('QR Code scanning coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20 overflow-y-scroll">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Join Quiz</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label 
            htmlFor="quizCode" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Quiz Code
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="quizCode"
              type="text"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter 8-character quiz code"
              maxLength={8}
            />
            <button
              onClick={handleQRCodeScan}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Scan QR Code"
            >
              <QrCode size={24} />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            <strong>Tip:</strong> Ask your instructor for the quiz code to join the quiz.
          </p>
        </div>

        <button
          onClick={handleJoinQuiz}
          disabled={isLoading || !quizCode.trim()}
          className={`
            w-full px-4 py-3 text-white rounded-lg transition-colors
            ${isLoading || !quizCode.trim() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary-500 hover:bg-primary-600'
            }
          `}
        >
          {isLoading ? 'Joining...' : 'Join Quiz'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Quiz codes are case-sensitive and expire after 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinQuizModal;