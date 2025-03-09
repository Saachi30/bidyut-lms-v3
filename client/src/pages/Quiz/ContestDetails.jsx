// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, Users, Trophy, ChevronLeft, Award, CheckCircle, AlertCircle, User, UserCheck } from 'lucide-react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';


// const ContestDetails = ({ contest, onBack, isRegistered, onRegister, currUserRole }) => {
//   const [registrationStatus, setRegistrationStatus] = useState(isRegistered ? 'registered' : 'not-registered');
//   const [score, setScore] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);
 

//   // Ensure participants is always an array
//   const participants = Array.isArray(contest.participants) ? contest.participants : [];

//   // Use participants instead of contest.participants in your calculations
//   const completionRate = Math.round(
//     (participants.filter(p => p.score > 0).length / (participants.length || 1)) * 100
//   );

//   const averageScore = Math.round(
//     participants.reduce((sum, p) => sum + (p.score || 0), 0) / (participants.length || 1)
//   );

//   useEffect(() => {
//     setRegistrationStatus(isRegistered ? 'registered' : 'not-registered');
//   }, [isRegistered]);

//   // Fetch contest attempt status and score
//   useEffect(() => {
//     const fetchQuizReport = async () => {
//       if (!contest?.quiz?.id) {
//         console.error('Quiz ID is missing');
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await axios.get(`http://localhost:5000/api/quizzes/reports/${contest.quiz.id}/latest`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         if (response.data.success && response.data.data) {
//           setScore(response.data.data.score); // Set the score if report exists
//         } else {
//           setScore(null); // No score available
//         }
//       } catch (error) {
//         console.error('Failed to fetch quiz report', error);
//         setError('Failed to fetch score. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isRegistered && contest?.quiz?.id) {
//       fetchQuizReport();
//     }
//   }, [contest?.quiz?.id, isRegistered]);
//   const handleViewScore = () => {
//     // Navigate to a page where the user can view their score
//     alert(`Your score: ${score}`);
//   };

//   const handleRegister = async () => {
//     await onRegister();
//     setRegistrationStatus('registered');
//   };

//   const handleStartContest = () => {
//     navigate(`/lms/quiz-attempt/${contest.quiz.id}`);
//   };

//   const now = new Date();
//   const isUpcoming = new Date(contest.startTime) > now;
//   const isOngoing = new Date(contest.startTime) <= now && new Date(contest.endTime) > now;
//   const isPast = new Date(contest.endTime) <= now;

//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getDuration = () => {
//     const durationMs = new Date(contest.endTime) - new Date(contest.startTime);
//     const hours = Math.floor(durationMs / (1000 * 60 * 60));
//     const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   const getButtonText = () => {
//     if (isPast) return 'View Results';
//     if (isOngoing) {
//       if (registrationStatus === 'registered') return 'Start Contest';
//       if (registrationStatus === 'completed') return 'Score Submitted';
//       return 'Register Now';
//     }
//     if (isUpcoming) {
//       if (registrationStatus === 'registered') return 'Registered';
//       return 'Register Now';
//     }
//     return 'Register';
//   };

//   const isButtonDisabled = () => {
//     return isPast || 
//            (isUpcoming && registrationStatus === 'registered') || 
//            registrationStatus === 'completed';
//   };

//   const handleButtonClick = () => {
//     if (isPast) {
//       // View results logic
//       return;
//     }

//     if (isOngoing) {
//       if (registrationStatus === 'registered') {
//         handleStartContest();
//       } else if (registrationStatus !== 'completed') {
//         handleRegister();
//       }
//     }

//     if (isUpcoming && registrationStatus !== 'registered') {
//       handleRegister();
//     }
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="p-8 bg-white">
//       <div className="mb-6">
//         <button 
//           onClick={onBack}
//           className="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
//         >
//           <ChevronLeft size={20} className="mr-1" />
//           Back to contests
//         </button>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Left column: Contest details */}
//         <div className="flex-1">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//             <div className="flex justify-between items-start mb-4">
//               <h1 className="text-3xl font-bold text-gray-800">{contest.quiz?.title}</h1>
//               <span className={`text-sm font-medium px-3 py-1 rounded-full ${
//                 isUpcoming ? 'text-amber-500 bg-amber-50' : 
//                 isOngoing ? 'text-emerald-500 bg-emerald-50' : 
//                 'text-gray-500 bg-gray-50'
//               }`}>
//                 {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Ended'}
//               </span>
//             </div>

//             <p className="text-gray-600 mb-6">{contest.quiz?.description}</p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//               <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//                 <Calendar size={20} className="mr-3 text-primary-500" />
//                 <div>
//                   <div className="text-sm text-gray-500">Start Time</div>
//                   <div className="font-medium">{formatDateTime(contest.startTime)}</div>
//                 </div>
//               </div>

//               <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//                 <Calendar size={20} className="mr-3 text-primary-500" />
//                 <div>
//                   <div className="text-sm text-gray-500">End Time</div>
//                   <div className="font-medium">{formatDateTime(contest.endTime)}</div>
//                 </div>
//               </div>

//               <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//                 <Clock size={20} className="mr-3 text-primary-500" />
//                 <div>
//                   <div className="text-sm text-gray-500">Duration</div>
//                   <div className="font-medium">{getDuration()}</div>
//                 </div>
//               </div>

//               <div className="flex items-center p-3 bg-gray-50 rounded-lg">
//                 <Trophy size={20} className="mr-3 text-primary-500" />
//                 <div>
//                   <div className="text-sm text-gray-500">Difficulty</div>
//                   <div className="font-medium capitalize">{contest.quiz?.difficulty || 'Medium'}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg mb-6">
//               <h3 className="text-lg font-semibold mb-2 text-gray-800">Contest Rules</h3>
//               <ul className="list-disc pl-5 text-gray-700 space-y-1">
//                 <li>You can only participate once in this contest.</li>
//                 <li>The timer starts as soon as you begin the contest.</li>
//                 <li>All questions must be completed within the allotted time.</li>
//                 <li>Correct answers earn points; incorrect answers have no penalty.</li>
//                 <li>Final rankings are determined by score and completion time.</li>
//               </ul>
//             </div>

//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-3 text-gray-800">Topics Covered</h3>
//               <div className="flex flex-wrap gap-2">
//                 {['Robotics', 'Programming', 'Electronics', 'Mechanics', 'AI & ML'].map((topic) => (
//                   <span key={topic} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
//                     {topic}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {currUserRole === 'student' && (
//               <button 
//                 onClick={handleButtonClick}
//                 disabled={isButtonDisabled()}
//                 className={`w-full py-3 px-6 rounded-xl font-medium ${
//                   isButtonDisabled() ? 
//                     'bg-gray-100 text-gray-400 cursor-not-allowed' : 
//                   (isOngoing && registrationStatus === 'registered') ?
//                     'bg-green-500 hover:bg-green-600 text-white' :
//                     'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
//                 } transition-all duration-300`}
//               >
//                 {getButtonText()}
//               </button>
//             )}
//           </div>

//           {/* Additional contest information */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800">Contest Details</h3>

//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-700 mb-2">Rewards</h4>
//                 <div className="flex gap-4">
//                   <div className="flex-1 p-4 bg-amber-50 rounded-lg border border-amber-100">
//                     <div className="flex items-center mb-2">
//                       <Award size={20} className="text-amber-500 mr-2" />
//                       <span className="font-medium text-amber-700">1st Place</span>
//                     </div>
//                     <p className="text-amber-700">500 points + Gold Badge</p>
//                   </div>
//                   <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                     <div className="flex items-center mb-2">
//                       <Award size={20} className="text-gray-500 mr-2" />
//                       <span className="font-medium text-gray-700">2nd Place</span>
//                     </div>
//                     <p className="text-gray-700">300 points + Silver Badge</p>
//                   </div>
//                   <div className="flex-1 p-4 bg-amber-50 rounded-lg border border-amber-100" style={{ backgroundColor: '#FEF3E9', borderColor: '#FADCBD' }}>
//                     <div className="flex items-center mb-2">
//                       <Award size={20} className="text-amber-800 mr-2" />
//                       <span className="font-medium text-amber-800">3rd Place</span>
//                     </div>
//                     <p className="text-amber-800">200 points + Bronze Badge</p>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium text-gray-700 mb-2">Participation Statistics</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="text-3xl font-bold text-primary-600 mb-1">{participants?.length || 0}</div>
//                     <div className="text-gray-600">Total Participants</div>
//                   </div>
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="text-3xl font-bold text-primary-600 mb-1">
//                       {Math.round((participants?.filter(p => p.score > 0).length || 0) / 
//                                 (participants?.length || 1) * 100)}%
//                     </div>
//                     <div className="text-gray-600">Completion Rate</div>
//                   </div>
//                   <div className="p-4 bg-gray-50 rounded-lg">
//                     <div className="text-3xl font-bold text-primary-600 mb-1">
//                       {Math.round(participants?.reduce((sum, p) => sum + (p.score || 0), 0) / 
//                                (participants?.length || 1))} pts
//                     </div>
//                     <div className="text-gray-600">Average Score</div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h4 className="font-medium text-gray-700 mb-2">Registration Status</h4>
//                 <div className={`flex items-center p-4 rounded-lg ${
//                   registrationStatus === 'registered' ? 'bg-emerald-50 border border-emerald-100' : 
//                   registrationStatus === 'completed' ? 'bg-blue-50 border border-blue-100' :
//                   'bg-gray-50 border border-gray-200'
//                 }`}>
//                   {registrationStatus === 'registered' ? (
//                     <>
//                       <CheckCircle size={24} className="text-emerald-500 mr-3" />
//                       <div>
//                         <div className="font-medium text-emerald-700">You are registered for this contest</div>
//                         {isUpcoming && (
//                           <p className="text-emerald-600 text-sm">
//                             The contest will begin on {formatDateTime(contest.startTime)}
//                           </p>
//                         )}
//                         {isOngoing && (
//                           <p className="text-emerald-600 text-sm">
//                             You can now start the contest. Good luck!
//                           </p>
//                         )}
//                       </div>
//                     </>
//                   ) : registrationStatus === 'completed' ? (
//                     <>
//                       <UserCheck size={24} className="text-blue-500 mr-3" />
//                       <div>
//                         <div className="font-medium text-blue-700">You've completed this contest</div>
//                         <p className="text-blue-600 text-sm">
//                           Your score: {score} points
//                         </p>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <AlertCircle size={24} className="text-gray-500 mr-3" />
//                       <div>
//                         <div className="font-medium text-gray-700">Not registered yet</div>
//                         {isUpcoming && (
//                           <p className="text-gray-600 text-sm">
//                             Register now to participate in this contest
//                           </p>
//                         )}
//                         {isOngoing && (
//                           <p className="text-gray-600 text-sm">
//                             This contest is currently active. Register to participate!
//                           </p>
//                         )}
//                         {isPast && (
//                           <p className="text-gray-600 text-sm">
//                             This contest has ended. You can view the results.
//                           </p>
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div>
//           {/* Button to view score */}
//           <button className="w-full py-2 mt-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium"
//             type="primary"
//             onClick={handleViewScore}
//             disabled={loading || score === null}
//             loading={loading}
//           >
//             {loading ? 'Loading...' : 'View Score'}
//           </button>

//           {/* Display score if available */}
//           {score !== null && (
//             <p>Your score: {score}</p>
//           )}
//         </div>

//         {/* Right column: Leaderboard */}
//         <div className="lg:w-1/3">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800">Leaderboard</h3>

//             {participants.length > 0 ? (
//               <div className="space-y-3">
//                 {participants
//                   .sort((a, b) => b.score - a.score)
//                   .map((participant, index) => (
//                     <div 
//                       key={participant.id}
//                       className={`flex items-center p-3 rounded-lg ${
//                         participant.userId === localStorage.getItem('userId') ? 'bg-primary-50 border border-primary-100' : 
//                         index < 3 ? 'bg-amber-50 border border-amber-100' :
//                         'bg-gray-50 border border-gray-200'
//                       }`}
//                     >
//                       <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
//                         index === 0 ? 'bg-amber-400 text-white' :
//                         index === 1 ? 'bg-gray-300 text-gray-800' :
//                         index === 2 ? 'bg-amber-700 text-white' :
//                         'bg-gray-200 text-gray-800'
//                       }`}>
//                         {index + 1}
//                       </div>
//                       <div className="flex-1">
//                         <div className="font-medium flex items-center">
//                           {participant.user.name}
//                           {participant.userId === localStorage.getItem('userId') && (
//                             <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
//                               You
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                       <div className="font-bold text-lg">{participant.score}</div>
//                     </div>
//                   ))}

//                 <button className="w-full py-2 mt-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium">
//                   View full leaderboard
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 {isPast ? (
//                   "Contest results will be available soon."
//                 ) : (
//                   "Leaderboard will be available once the contest begins."
//                 )}
//               </div>
//             )}

//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <h4 className="font-medium text-gray-700 mb-3">Contest Information</h4>
//               <div className="space-y-3">
//                 <div className="flex items-center text-gray-600">
//                   <Users size={18} className="mr-2 text-primary-500" />
//                   <span>{participants?.length || 0} participants</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <Trophy size={18} className="mr-2 text-primary-500" />
//                   <span>Top 10 receive badges</span>
//                 </div>
//                 <div className="flex items-center text-gray-600">
//                   <User size={18} className="mr-2 text-primary-500" />
//                   <span>Organized by {contest.organizer?.name || 'Admin'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContestDetails;
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Trophy, ChevronLeft, Award, CheckCircle, AlertCircle, User, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ContestDetails = ({ contest, onBack, isRegistered, onRegister, currUserRole }) => {
  // Added a new status "attempted" to track if user has taken the quiz
  const [registrationStatus, setRegistrationStatus] = useState(isRegistered ? 'registered' : 'not-registered');
  const [hasAttempted, setHasAttempted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
 
  // Ensure participants is always an array
  const participants = Array.isArray(contest.participants) ? contest.participants : [];

  // Use participants instead of contest.participants in your calculations
  const completionRate = Math.round(
    (participants.filter(p => p.score > 0).length / (participants.length || 1)) * 100
  );

  const averageScore = Math.round(
    participants.reduce((sum, p) => sum + (p.score || 0), 0) / (participants.length || 1)
  );

  useEffect(() => {
    setRegistrationStatus(isRegistered ? 'registered' : 'not-registered');
  }, [isRegistered]);

 // Check localStorage for attempt status on component mount
 useEffect(() => {
  // Check localStorage for attempt status
  const hasAttempted = localStorage.getItem(`contest_${contest.id}_attempted`);
  if (hasAttempted === 'true') {
    setHasAttempted(true); // Update state
  }

  // Fetch quiz report and score (existing logic)
  const fetchQuizReport = async () => {
    if (!contest?.quiz?.id) {
      console.error('Quiz ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:5000/api/quizzes/reports/${contest.quiz.id}/latest`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success && response.data.data) {
        setHasAttempted(true);
        setScore(response.data.data.score);
      } else {
        setHasAttempted(false);
        setScore(null);
      }
    } catch (error) {
      console.error('Failed to fetch quiz report', error);
      setError('Failed to fetch score. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered && contest?.quiz?.id) {
    fetchQuizReport();
  }
}, [contest?.quiz?.id, isRegistered, contest.id]); // Add contest.id to dependency array

const handleStartContest = () => {
  // Check if the user has already attempted the contest
  const hasAttempted = localStorage.getItem(`contest_${contest.id}_attempted`);
  if (hasAttempted === 'true') {
    alert('You have already attempted this contest.');
    return;
  }
  if (isPast) {
    localStorage.removeItem(`contest_${contest.id}_attempted`);
  }
  // Store attempt status in localStorage
  localStorage.setItem(`contest_${contest.id}_attempted`, 'true');
  navigate(`/lms/quiz-attempt/${contest.quiz.id}`);
};
  
  const handleViewScore = () => {
    // Only show score if user has attempted the quiz
    if (hasAttempted && score !== null) {
      alert(`Your score: ${score}`);
    } else {
      alert('You need to attempt the contest first to view your score.');
    }
  };

  const handleRegister = async () => {
    await onRegister();
    setRegistrationStatus('registered');
  };

  const now = new Date();
  const isUpcoming = new Date(contest.startTime) > now;
  const isOngoing = new Date(contest.startTime) <= now && new Date(contest.endTime) > now;
  const isPast = new Date(contest.endTime) <= now;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    const durationMs = new Date(contest.endTime) - new Date(contest.startTime);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getButtonText = () => {
    if (isPast) return 'View Results';
    if (isOngoing) {
      if (hasAttempted) return 'Already Attempted';
      if (registrationStatus === 'registered') return 'Start Contest';
      if (registrationStatus === 'completed') return 'Score Submitted';
      return 'Register Now';
    }
    if (isUpcoming) {
      if (registrationStatus === 'registered') return 'Registered';
      return 'Register Now';
    }
    return 'Register';
  };

  const isButtonDisabled = () => {
    return isPast || 
           (isUpcoming && registrationStatus === 'registered') || 
           registrationStatus === 'completed' ||
           hasAttempted; // Disable button if user has attempted
  };

  const handleButtonClick = () => {
    if (isPast) {
      // View results logic
      return;
    }

    if (isOngoing) {
      if (registrationStatus === 'registered' && !hasAttempted) {
        handleStartContest();
      } else if (registrationStatus !== 'completed' && !hasAttempted) {
        handleRegister();
      }
    }

    if (isUpcoming && registrationStatus !== 'registered') {
      handleRegister();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 bg-white">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-primary-500 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to contests
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column: Contest details */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-800">{contest.quiz?.title}</h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isUpcoming ? 'text-amber-500 bg-amber-50' : 
                isOngoing ? 'text-emerald-500 bg-emerald-50' : 
                'text-gray-500 bg-gray-50'
              }`}>
                {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Ended'}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{contest.quiz?.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar size={20} className="mr-3 text-primary-500" />
                <div>
                  <div className="text-sm text-gray-500">Start Time</div>
                  <div className="font-medium">{formatDateTime(contest.startTime)}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Calendar size={20} className="mr-3 text-primary-500" />
                <div>
                  <div className="text-sm text-gray-500">End Time</div>
                  <div className="font-medium">{formatDateTime(contest.endTime)}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Clock size={20} className="mr-3 text-primary-500" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{getDuration()}</div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Trophy size={20} className="mr-3 text-primary-500" />
                <div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                  <div className="font-medium capitalize">{contest.quiz?.difficulty || 'Medium'}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Contest Rules</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>You can only participate once in this contest.</li>
                <li>The timer starts as soon as you begin the contest.</li>
                <li>All questions must be completed within the allotted time.</li>
                <li>Correct answers earn points; incorrect answers have no penalty.</li>
                <li>Final rankings are determined by score and completion time.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {['Robotics', 'Programming', 'Electronics', 'Mechanics', 'AI & ML'].map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {currUserRole === 'student' && (
              <button 
                onClick={handleButtonClick}
                disabled={isButtonDisabled()}
                className={`w-full py-3 px-6 rounded-xl font-medium ${
                  isButtonDisabled() ? 
                    'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                  (isOngoing && registrationStatus === 'registered') ?
                    'bg-green-500 hover:bg-green-600 text-white' :
                    'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
                } transition-all duration-300`}
              >
                {getButtonText()}
              </button>
            )}
          </div>

          {/* Additional contest information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Contest Details</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Rewards</h4>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center mb-2">
                      <Award size={20} className="text-amber-500 mr-2" />
                      <span className="font-medium text-amber-700">1st Place</span>
                    </div>
                    <p className="text-amber-700">500 points + Gold Badge</p>
                  </div>
                  <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Award size={20} className="text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">2nd Place</span>
                    </div>
                    <p className="text-gray-700">300 points + Silver Badge</p>
                  </div>
                  <div className="flex-1 p-4 bg-amber-50 rounded-lg border border-amber-100" style={{ backgroundColor: '#FEF3E9', borderColor: '#FADCBD' }}>
                    <div className="flex items-center mb-2">
                      <Award size={20} className="text-amber-800 mr-2" />
                      <span className="font-medium text-amber-800">3rd Place</span>
                    </div>
                    <p className="text-amber-800">200 points + Bronze Badge</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Participation Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600 mb-1">{participants?.length || 0}</div>
                    <div className="text-gray-600">Total Participants</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {Math.round((participants?.filter(p => p.score > 0).length || 0) / 
                                (participants?.length || 1) * 100)}%
                    </div>
                    <div className="text-gray-600">Completion Rate</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {Math.round(participants?.reduce((sum, p) => sum + (p.score || 0), 0) / 
                               (participants?.length || 1))} pts
                    </div>
                    <div className="text-gray-600">Average Score</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Registration Status</h4>
                <div className={`flex items-center p-4 rounded-lg ${
                  hasAttempted ? 'bg-blue-50 border border-blue-100' :
                  registrationStatus === 'registered' ? 'bg-emerald-50 border border-emerald-100' : 
                  registrationStatus === 'completed' ? 'bg-blue-50 border border-blue-100' :
                  'bg-gray-50 border border-gray-200'
                }`}>
                  {hasAttempted ? (
                    <>
                      <UserCheck size={24} className="text-blue-500 mr-3" />
                      <div>
                        <div className="font-medium text-blue-700">You've attempted this contest</div>
                        {score !== null ? (
                          <p className="text-blue-600 text-sm">
                            Your score: {score} points
                          </p>
                        ) : (
                          <p className="text-blue-600 text-sm">
                            Your submission is being processed
                          </p>
                        )}
                      </div>
                    </>
                  ) : registrationStatus === 'registered' ? (
                    <>
                      <CheckCircle size={24} className="text-emerald-500 mr-3" />
                      <div>
                        <div className="font-medium text-emerald-700">You are registered for this contest</div>
                        {isUpcoming && (
                          <p className="text-emerald-600 text-sm">
                            The contest will begin on {formatDateTime(contest.startTime)}
                          </p>
                        )}
                        {isOngoing && (
                          <p className="text-emerald-600 text-sm">
                            You can now start the contest. Good luck!
                          </p>
                        )}
                      </div>
                    </>
                  ) : registrationStatus === 'completed' ? (
                    <>
                      <UserCheck size={24} className="text-blue-500 mr-3" />
                      <div>
                        <div className="font-medium text-blue-700">You've completed this contest</div>
                        <p className="text-blue-600 text-sm">
                          Your score: {score} points
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={24} className="text-gray-500 mr-3" />
                      <div>
                        <div className="font-medium text-gray-700">Not registered yet</div>
                        {isUpcoming && (
                          <p className="text-gray-600 text-sm">
                            Register now to participate in this contest
                          </p>
                        )}
                        {isOngoing && (
                          <p className="text-gray-600 text-sm">
                            This contest is currently active. Register to participate!
                          </p>
                        )}
                        {isPast && (
                          <p className="text-gray-600 text-sm">
                            This contest has ended. You can view the results.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Score viewing section - Only show button if user has attempted */}
        <div>
          {hasAttempted && (
            <button 
              className="w-full py-2 mt-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium"
              type="primary"
              onClick={handleViewScore}
              disabled={loading || score === null}
            >
              {loading ? 'Loading...' : 'View Score'}
            </button>
          )}

          {/* Display score only if available and attempted */}
          {hasAttempted && score !== null && (
            <p className="text-center mt-2 font-medium">Your score: {score}</p>
          )}
        </div>

        {/* Right column: Leaderboard */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Leaderboard</h3>

            {participants.length > 0 ? (
              <div className="space-y-3">
                {participants
                  .sort((a, b) => b.score - a.score)
                  .map((participant, index) => (
                    <div 
                      key={participant.id}
                      className={`flex items-center p-3 rounded-lg ${
                        participant.userId === localStorage.getItem('userId') ? 'bg-primary-50 border border-primary-100' : 
                        index < 3 ? 'bg-amber-50 border border-amber-100' :
                        'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-800' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium flex items-center">
                          {participant.user.name}
                          {participant.userId === localStorage.getItem('userId') && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-lg">{participant.score}</div>
                    </div>
                  ))}

                <button className="w-full py-2 mt-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium">
                  View full leaderboard
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {isPast ? (
                  "Contest results will be available soon."
                ) : (
                  "Leaderboard will be available once the contest begins."
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Contest Information</h4>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Users size={18} className="mr-2 text-primary-500" />
                  <span>{participants?.length || 0} participants</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Trophy size={18} className="mr-2 text-primary-500" />
                  <span>Top 10 receive badges</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <User size={18} className="mr-2 text-primary-500" />
                  <span>Organized by {contest.organizer?.name || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestDetails;