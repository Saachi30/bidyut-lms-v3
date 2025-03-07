import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Clock, BookOpen, Users, ArrowRight, X, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../../utils/SocketContext';

const CoursesQuiz = ({ currUserRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isQuizCodeModalOpen, setIsQuizCodeModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const socket = useSocket();

  // Parse user data safely
  const currentUser = (() => {
    try {
      const userString = localStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  })();

  // Fetch quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/quizzes/${id}`);
        const quizData = response.data.data;
        setQuiz(quizData);
        setParticipants(quizData.participants || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch quiz');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Socket room and participant management
  useEffect(() => {
    if (socket && currentUser) {
      const roomKey = `quiz_room_${id}`;

      // Join quiz room
      socket.emit('joinQuizRoom', { 
        quizId: parseInt(id), 
        userId: currentUser.id 
      });

      // Listen for quiz start event
      const handleQuizStarted = (data) => {
        if (data.quizId === parseInt(id)) {
          // Check if current user is in the list of participants
          if (data.participants.includes(currentUser.id)) {
            setQuizStarted(true);
            navigate(`/lms/quiz-attempt/${id}`);
          }
        }
      };

      // Listen for new participants joining
      const handleUserJoined = (data) => {
        setParticipants((prevParticipants) => {
          const participantExists = prevParticipants.some(p => p.userId === data.userId);
          if (!participantExists) {
            return [...prevParticipants, { userId: data.userId, userName: data.userName }];
          }
          return prevParticipants;
        });
      };

      // Listen for participants leaving
      const handleUserLeft = (data) => {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p.userId !== data.userId)
        );
      };

      socket.on('quizStarted', handleQuizStarted);
      socket.on('userJoined', handleUserJoined);
      socket.on('userLeft', handleUserLeft);

      // Cleanup
      return () => {
        socket.off('quizStarted', handleQuizStarted);
        socket.off('userJoined', handleUserJoined);
        socket.off('userLeft', handleUserLeft);
        socket.emit('leaveQuizRoom', { quizId: parseInt(id), userId: currentUser.id });
      };
    }
  }, [socket, currentUser, id, navigate]);

  // Start quiz for all participants
  const handleStartQuiz = useCallback(() => {
    if (currentUser && ['admin', 'faculty', 'institute'].includes(currUserRole)) {
      socket.emit('startQuizForAll', { 
        quizId: parseInt(id), 
        userId: currentUser.id 
      });
    } else {
      setError('You do not have permission to start the quiz.');
    }
  }, [currentUser, currUserRole, socket, id]);

  // Enhanced copy quiz code function with fallback methods
  const handleCopyQuizCode = useCallback(() => {
    if (!quiz?.quizCode) return;

    // Try using the modern clipboard API
    const copyWithClipboardAPI = async () => {
      try {
        await navigator.clipboard.writeText(quiz.quizCode);
        showCopySuccess();
      } catch (err) {
        console.error('Clipboard API failed:', err);
        // Fall back to document.execCommand method
        copyWithExecCommand();
      }
    };

    // Fallback copy method using document.execCommand
    const copyWithExecCommand = () => {
      try {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        // Set its value to the quiz code
        textArea.value = quiz.quizCode;
        // Make it invisible
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        // Add it to the document
        document.body.appendChild(textArea);
        // Select the text
        textArea.focus();
        textArea.select();
        // Execute the copy command
        const successful = document.execCommand('copy');
        // Remove the temporary element
        document.body.removeChild(textArea);
        
        if (successful) {
          showCopySuccess();
        } else {
          console.error('fallback copy method failed');
        }
      } catch (err) {
        console.error('Copy fallback failed:', err);
      }
    };

    // Show success feedback and reset after delay
    const showCopySuccess = () => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    };

    // Try the modern method first
    copyWithClipboardAPI();
  }, [quiz]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <Link to="/lms/courses" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-6">
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Courses</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{quiz?.title}</h1>
                <p className="text-gray-600 mt-2">{quiz?.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <BookOpen size={16} className="mr-2" />
                  <span>Course: {quiz?.subtopic?.title}</span>
                </div>
                {quiz?.quizCode && (
                  <div 
                    onClick={() => setIsQuizCodeModalOpen(true)}
                    className="mt-2 text-sm text-gray-600 cursor-pointer hover:text-primary-600 transition-colors"
                  >
                    Quiz Code: <span className="font-bold underline">{quiz.quizCode}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 md:mt-0 flex flex-col items-center bg-primary-50 p-4 rounded-xl text-primary-700">
                <Clock size={24} className="mb-2" />
                <div className="text-2xl font-bold">10 min</div>
                <div className="text-sm">Duration</div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quiz Instructions</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">1</div>
                  <span>You will have 10 minutes to complete the quiz.</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">2</div>
                  <span>Each question has only one correct answer.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Participants</h3>
              <div className="space-y-3">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <div 
                      key={participant.userId} 
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="font-medium">{participant.userName}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center">No participants yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Quiz Code Modal */}
          {isQuizCodeModalOpen && quiz?.quizCode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-96 relative">
                <button 
                  onClick={() => setIsQuizCodeModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">Quiz Code</h2>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <span className="text-3xl font-bold text-gray-800">{quiz.quizCode}</span>
                  <button 
                    onClick={handleCopyQuizCode}
                    className="p-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {copySuccess ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                {copySuccess && (
                  <div className="mt-3 text-center text-green-500 text-sm">
                    Quiz code copied to clipboard!
                  </div>
                )}
              </div>
            </div>
          )}

          {['admin', 'faculty', 'institute'].includes(currUserRole) && !quizStarted && (
            <div className="flex justify-end">
              <button
                onClick={handleStartQuiz}
                className="px-6 py-3 flex items-center space-x-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
              >
                <span>Start Quiz for All Students</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {quizStarted && (
            <div className="text-center text-green-600 font-bold">
              Quiz Has Started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesQuiz;