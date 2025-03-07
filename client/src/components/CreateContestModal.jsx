import React, { useState } from 'react';
import { X, PlusCircle, BookOpen } from 'lucide-react';
import axios from 'axios';

const CreateContestModal = ({ onClose, onCreate }) => {
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!selectedQuiz) {
      setError('Please enter a Quiz ID');
      return;
    }
    if (!startTime || !endTime) {
      setError('Please provide start and end times');
      return;
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      const response = await axios.post('/api/contests', {
        quizId: parseInt(selectedQuiz),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        onCreate(response.data.data);
        onClose();
      } else {
        setError(response.data.message || 'Failed to create contest');
      }
    } catch (error) {
      console.error('Contest creation error', error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-4 border-primary-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={28} strokeWidth={2} />
        </button>

        <div className="flex items-center mb-6">
          <BookOpen size={32} className="mr-3 text-primary-500" />
          <h2 className="text-3xl font-bold text-gray-800">Create New Contest</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">
              Quiz ID
            </label>
            <input 
              type="number"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              placeholder="Enter Quiz ID"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-400 
                         text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">Start Time</label>
              <input 
                type="datetime-local" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary-400 
                           text-gray-700 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-semibold">End Time</label>
              <input 
                type="datetime-local" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-primary-400 
                           text-gray-700 cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg 
                            flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 
                       bg-primary-500 text-white rounded-lg 
                       hover:bg-primary-600 transition-all duration-300 
                       font-semibold space-x-2"
          >
            <PlusCircle size={20} />
            <span>Create Contest</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContestModal;