import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useSocket } from '../../utils/SocketContext';

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [lockedAnswers, setLockedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reportId, setReportId] = useState(null);
  const socket = useSocket();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setCurrentUser(response.data.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Socket event listeners for leaderboard
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinQuizRoom', { 
      quizId: parseInt(id), 
      userId: currentUser?.id 
    });

    socket.on('scoreUpdate', (data) => {
      setLeaderboard(prev => {
        const existingIndex = prev.findIndex(p => p.userId === data.userId);
        
        if (existingIndex !== -1) {
          // Update existing participant's score
          const updatedLeaderboard = [...prev];
          updatedLeaderboard[existingIndex] = {
            ...updatedLeaderboard[existingIndex],
            score: data.newScore
          };
          return updatedLeaderboard;
        } else {
          // Add new participant to leaderboard
          return [...prev, {
            userId: data.userId,
            score: data.newScore,
            totalQuestions: data.totalQuestions
          }];
        }
      });
    });

    return () => {
      socket.off('scoreUpdate');
    };
  }, [socket, id, currentUser]);
  // Fetch latest quiz report for resuming
  useEffect(() => {
    const fetchLatestQuizReport = async () => {
      if (!id || !currentUser) return;

      try {
        const response = await axios.get(`/api/quizzes/reports/${id}/latest`);
        const latestReport = response.data.data;

        if (latestReport) {
          // Resume from saved state
          setReportId(latestReport.id);
          
          if (latestReport.answers) {
            const savedAnswers = JSON.parse(latestReport.answers);
            setAnswers(savedAnswers);
            setScore(latestReport.score || 0);
          }

          if (latestReport.currentQuestionIndex !== undefined) {
            setCurrentQuestionIndex(latestReport.currentQuestionIndex);
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest quiz report:', err);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchLatestQuizReport();
  }, [id, currentUser]);

  const updateQuizProgress = async (currentScore, saveCurrentQuestionIndex = true) => {
    if (!currentUser) return;
    
    try {
      setSubmitting(true);

      const reportData = {
        quizId: parseInt(id),
        score: currentScore,
        answers: answers,
        ...(saveCurrentQuestionIndex ? { currentQuestionIndex } : {})
      };

      if (!reportId) {
        const response = await axios.post('/api/quizzes/reports', reportData);
        setReportId(response.data.data.id);
      } else {
        await axios.put(`/api/quizzes/reports/${reportId}`, reportData);
      }

      if (socket && currentUser) {
        socket.emit('updateScore', {
          quizId: id,
          userId: currentUser.id,
          newScore: currentScore,
          totalQuestions: questions.length
        });
      }

      setSubmitting(false);
    } catch (err) {
      console.error('Failed to update quiz progress:', err);
      setSubmitting(false);
    }
  };

  

  const submitQuiz = async () => {
    if (!currentUser || initialLoad) return;
    
    try {
      setSubmitting(true);

      const finalScore = score;

      const reportData = {
        quizId: parseInt(id),
        score: finalScore,
        completed: true,
        answers: answers
      };

      const baseURL = import.meta.env.VITE_BASE_URL;
      if (reportId) {
        await axios.put(`${baseURL}api/quizzes/reports/${reportId}`, reportData);
      } else {
        const response = await axios.post(`${baseURL}api/quizzes/reports`, reportData);
        setReportId(response.data.data.id);
      }

      const results = {
        quizId: id,
        quizTitle: quiz.title,
        score: finalScore,
        totalQuestions: questions.length,
        answers: answers,
        questions: questions,
        reportId: reportId,
        completedAt: new Date().toISOString()
      };

      sessionStorage.setItem('quizResults', JSON.stringify(results));

      setSubmitting(false);

      navigate(`/lms/quiz-results/${id}`);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  const Leaderboard = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Live Leaderboard</h3>
      {leaderboard.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No participants yet
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard
            .sort((a, b) => b.score - a.score)
            .map((entry, index) => (
              <div 
                key={entry.userId} 
                className={`flex justify-between items-center p-2 rounded-lg ${
                  entry.userId === currentUser?.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                    index === 0 ? 'bg-yellow-400 text-white font-bold' : 
                    index === 1 ? 'bg-gray-300 text-gray-800 font-bold' : 
                    index === 2 ? 'bg-yellow-600 text-white font-bold' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {index + 1}
                  </div>
                  <span
                  className={`${entry.userId === currentUser?.id ? 'font-medium' : ''}`}>
                  {`User ${typeof entry.userId === 'string' ? entry.userId.slice(0, 6) : entry.userId}`}
                </span>
              </div>
              <div className="font-medium text-right">
                <div className="text-lg">{entry.score}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/quizzes/${id}`);
                const quizData = response.data.data;
                setQuiz(quizData);

                let parsedQuestions = typeof quizData.questions === 'string'
                    ? JSON.parse(quizData.questions)
                    : quizData.questions;

                parsedQuestions = parsedQuestions.map(q => {
                    if (q.answer && !q.correctAnswer) {
                        const correctIndex = q.options.findIndex(opt => opt === q.answer);
                        return { ...q, correctAnswer: correctIndex >= 0 ? correctIndex : 0 };
                    }
                    return q;
                });

                setQuestions(parsedQuestions);

                const initialAnswers = {};
                const initialLockedAnswers = {};
                parsedQuestions.forEach((_, index) => {
                    initialAnswers[index] = null;
                    initialLockedAnswers[index] = false;
                });
                setAnswers(initialAnswers);
                setLockedAnswers(initialLockedAnswers);

                try {
                    const leaderboardResponse = await axios.get(`/api/quizzes/${id}/participants`);
                    if (leaderboardResponse.data.data && leaderboardResponse.data.data.length > 0) {
                        setLeaderboard(leaderboardResponse.data.data.map(participant => ({
                            userId: participant.userId,
                            score: participant.score,
                            totalQuestions: parsedQuestions.length
                        })));
                    }
                } catch (leaderboardErr) {
                    console.error('Failed to fetch leaderboard data:', leaderboardErr);
                }

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch quiz');
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (loading || !quiz) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, quiz]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const updateReport = async (currentScore) => {
        if (!currentUser) return;
        
        try {
            setSubmitting(true);

            if (!reportId) {
                const response = await axios.post('/api/quizzes/reports', {
                    quizId: parseInt(id),
                    score: currentScore
                });

                setReportId(response.data.data.id);
            } else {
                await axios.put(`/api/quizzes/reports/${reportId}`, {
                    score: currentScore
                });
            }

            if (socket && currentUser) {
                socket.emit('updateScore', {
                    quizId: id,
                    userId: currentUser.id,
                    newScore: currentScore,
                    totalQuestions: questions.length
                });
            }

            setSubmitting(false);
        } catch (err) {
            console.error('Failed to submit/update progress report:', err);
            setSubmitting(false);
        }
    };

    const handleOptionSelect = async (optionIndex) => {
        // Check for current user and prevent actions during initial load
        if (!currentUser || initialLoad) return;
    
        // Prevent multiple selections for the same question
        if (lockedAnswers[currentQuestionIndex]) {
            return;
        }
    
        // Get the previous answer for the current question
        const previousAnswer = answers[currentQuestionIndex];
    
        // Update answers
        const newAnswers = {
            ...answers,
            [currentQuestionIndex]: optionIndex
        };
        setAnswers(newAnswers);
    
        // Calculate new score
        let newScore = score;
        const currentQuestion = questions[currentQuestionIndex];
    
        // Score calculation logic
        if (currentQuestion.correctAnswer === optionIndex) {
            if (previousAnswer !== currentQuestion.correctAnswer) {
                newScore += 10;
            }
        }
        else if (previousAnswer === currentQuestion.correctAnswer) {
            newScore -= 10;
        }
    
        // Update score
        setScore(newScore);
    
        // Lock the current question to prevent further changes
        setLockedAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: true
        }));
    
        // Update leaderboard
        setLeaderboard(prev => {
            const existing = prev.find(p => p.userId === currentUser.id);
            if (existing) {
                return prev.map(p =>
                    p.userId === currentUser.id
                        ? { ...p, score: newScore }
                        : p
                );
            }
            return [...prev, {
                userId: currentUser.id,
                score: newScore,
                totalQuestions: questions.length
            }];
        });
    
        // Update progress after each answer
        await updateQuizProgress(newScore);
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading quiz...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">No questions found for this quiz.</div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = answers[currentQuestionIndex] !== null;
    const isLocked = lockedAnswers[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-3/4">
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
                                <p className="text-gray-600 text-sm mt-1">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                                    <span className="font-medium">Score: {score}</span>
                                </div>

                                <div className={`flex items-center p-2 rounded-lg ${
                                    timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                    <Clock size={20} className="mr-2" />
                                    <span className="font-medium">{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                        </div>

                        {submitting && (
                            <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center">
                                <span>Saving your progress...</span>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="bg-gray-50 p-6 rounded-xl mb-6">
                                <h2 className="text-xl font-medium text-gray-800 mb-2">
                                    {currentQuestion.question}
                                </h2>
                                {currentQuestion.topic && (
                                    <div className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        {currentQuestion.topic}
                                    </div>
                                )}
                            </div>

                            {isLocked && (
                                <div className="mb-3 p-2 bg-yellow-50 text-yellow-700 rounded-lg flex items-center">
                                    <AlertCircle size={18} className="mr-2" />
                                    <span>This answer has been submitted and cannot be changed.</span>
                                </div>
                            )}

                            <div className="space-y-3 mb-6">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionSelect(index)}
                                        disabled={submitting || isLocked}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                            submitting || isLocked ? 'opacity-70 cursor-not-allowed' : ''
                                        } ${
                                            answers[currentQuestionIndex] === index
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                                                answers[currentQuestionIndex] === index
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span>{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={goToPrevQuestion}
                                disabled={currentQuestionIndex === 0 || submitting}
                                className={`px-4 py-2 flex items-center space-x-2 rounded-lg ${
                                    currentQuestionIndex === 0 || submitting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronLeft size={20} />
                                <span>Previous</span>
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={submitQuiz}
                                    disabled={submitting}
                                    className={`px-6 py-2 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg hover:shadow-lg transition-all duration-300 ${
                                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </button>
                            ) : (
                                <button
                                    onClick={goToNextQuestion}
                                    disabled={submitting}
                                    className={`px-4 py-2 flex items-center space-x-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 ${
                                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Question Navigation</h3>
                        <div className="flex flex-wrap gap-2">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    disabled={submitting}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        submitting ? 'opacity-70' : ''
                                    } ${
                                        currentQuestionIndex === index
                                            ? 'bg-primary-600 text-white'
                                            : answers[index] !== null
                                                ? lockedAnswers[index]
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/4 sticky top-6">
                    <Leaderboard />
                </div>
            </div>
        </div>
    );
};

export default QuizAttempt;