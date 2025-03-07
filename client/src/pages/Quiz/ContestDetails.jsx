import React, { useState } from 'react';
import { Calendar, Clock, Users, Trophy, ChevronLeft, Award, CheckCircle, AlertCircle, User, UserCheck } from 'lucide-react';

const ContestDetails = ({ contest, onBack }) => {
  const [registrationStatus, setRegistrationStatus] = useState('not-registered'); // 'not-registered', 'registered', 'completed'
  
  const handleRegister = () => {
    // In a real app, this would make an API call to register the user
    setRegistrationStatus('registered');
  };
  
  const handleStartContest = () => {
    // In a real app, this would navigate to the quiz interface
    alert('Starting contest: ' + contest.title);
  };
  
  const now = new Date();
  const isUpcoming = contest.startTime > now;
  const isOngoing = contest.startTime <= now && contest.endTime > now;
  const isPast = contest.endTime <= now;
  
  const formatDateTime = (date) => {
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
    const durationMs = contest.endTime - contest.startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };
  
  const getButtonText = () => {
    if (isPast) return 'View Results';
    if (isOngoing) {
      if (registrationStatus === 'registered') return 'Start Contest';
      return 'Register Now';
    }
    if (isUpcoming) {
      if (registrationStatus === 'registered') return 'Registered';
      return 'Register Now';
    }
    return 'Register';
  };
  
  const isButtonDisabled = () => {
    return isPast || (isUpcoming && registrationStatus === 'registered');
  };
  
  const handleButtonClick = () => {
    if (isPast) {
      // View results logic
      return;
    }
    
    if (isOngoing) {
      if (registrationStatus === 'registered') {
        handleStartContest();
      } else {
        handleRegister();
      }
    }
    
    if (isUpcoming && registrationStatus !== 'registered') {
      handleRegister();
    }
  };

  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', score: 950, isCurrentUser: false },
    { rank: 2, name: 'Maria Garcia', score: 925, isCurrentUser: false },
    { rank: 3, name: 'David Smith', score: 890, isCurrentUser: false },
    { rank: 4, name: 'Emma Wilson', score: 845, isCurrentUser: false },
    { rank: 5, name: 'James Brown', score: 830, isCurrentUser: true }
  ];
  
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
              <h1 className="text-3xl font-bold text-gray-800">{contest.title}</h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                isUpcoming ? 'text-amber-500 bg-amber-50' : 
                isOngoing ? 'text-emerald-500 bg-emerald-50' : 
                'text-gray-500 bg-gray-50'
              }`}>
                {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Ended'}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">{contest.description}</p>
            
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
                  <div className="font-medium capitalize">{contest.difficulty}</div>
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
                {['Algebra', 'Calculus', 'Geometry', 'Trigonometry', 'Statistics'].map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            
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
                      <Award size={20} className="text-amber-600 mr-2" style={{ color: '#B87333' }} />
                      <span className="font-medium text-amber-800" style={{ color: '#8B4513' }}>3rd Place</span>
                    </div>
                    <p className="text-amber-700" style={{ color: '#8B4513' }}>150 points + Bronze Badge</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Certificate</h4>
                <p className="text-gray-600">
                  All participants who score above 70% will receive a digital certificate of achievement.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Organizer</h4>
                <p className="text-gray-600">
                  This contest is organized by the Department of Mathematics, in collaboration with 
                  the Student Competition Committee.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column: Leaderboard */}
        <div className="lg:w-96">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Trophy size={20} className="mr-2 text-primary-500" />
              Leaderboard
            </h3>
            
            {isPast ? (
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div key={entry.rank} className={`p-3 rounded-lg flex items-center justify-between ${
                    entry.rank === 1 ? 'bg-amber-50 border border-amber-100' : 
                    entry.rank === 2 ? 'bg-gray-50 border border-gray-200' :
                    entry.rank === 3 ? 'bg-amber-50 border border-amber-100' : 
                    entry.isCurrentUser ? 'bg-primary-50 border border-primary-100' : ''
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-amber-500 text-white' : 
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-amber-600 text-white' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium flex items-center">
                          {entry.name}
                          {entry.isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-700">{entry.score}</div>
                  </div>
                ))}
                <div className="mt-4 text-center">
                  <a href="#" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    View full leaderboard
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="text-gray-400 mb-3">
                  <Trophy size={48} className="mx-auto opacity-30" />
                </div>
                <h4 className="text-gray-700 font-medium mb-2">
                  {isUpcoming ? 'Contest not started yet' : 'Results pending'}
                </h4>
                <p className="text-gray-500 text-sm">
                  {isUpcoming 
                    ? 'Leaderboard will be available once the contest begins'
                    : 'Leaderboard will be updated when the contest ends'
                  }
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-700 mb-3">Participants</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users size={18} className="text-primary-500 mr-2" />
                  <span className="text-gray-600">{contest.participants} registered</span>
                </div>
                {isUpcoming && (
                  <a href="#" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                    Invite friends
                  </a>
                )}
              </div>
              
              <div className="mt-3 flex">
                {/* Fake participant avatar icons */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                    style={{ marginLeft: i > 0 ? '-8px' : 0 }}
                  >
                    <User size={16} />
                  </div>
                ))}
                <div 
                  className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500"
                  style={{ marginLeft: '-8px' }}
                >
                  +{contest.participants - 5}
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