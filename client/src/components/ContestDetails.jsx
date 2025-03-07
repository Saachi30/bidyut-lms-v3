import React from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Trophy, 
  FileText 
} from 'lucide-react';

const ContestDetails = ({ contest, onBack, currUserRole }) => {
  const getStatusColor = () => {
    const now = new Date();
    if (contest.startTime > now) {
      return 'text-amber-500 bg-amber-50';
    } else if (contest.endTime > now) {
      return 'text-emerald-500 bg-emerald-50';
    } else {
      return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusText = () => {
    const now = new Date();
    if (contest.startTime > now) {
      return 'Upcoming';
    } else if (contest.endTime > now) {
      return 'Ongoing';
    } else {
      return 'Ended';
    }
  };

  const renderParticipantsList = () => {
    return contest.participants.map((participant) => (
      <div 
        key={participant.id} 
        className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-2"
      >
        <span>{participant.user.name}</span>
        <span className="font-semibold">{participant.score} points</span>
      </div>
    ));
  };

  return (
    <div className="p-8 bg-white">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="mr-2" /> Back to Contests
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contest Information */}
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {contest.quiz.title}
              </h1>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center text-gray-600">
              <FileText className="mr-3 text-primary-500" size={24} />
              <p>{contest.quiz.description}</p>
            </div>

            <div className="flex items-center text-gray-600">
              <Calendar className="mr-3 text-primary-500" size={24} />
              <span>
                Start: {new Date(contest.startTime).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center text-gray-600">
              <Clock className="mr-3 text-primary-500" size={24} />
              <span>
                End: {new Date(contest.endTime).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center text-gray-600">
              <Users className="mr-3 text-primary-500" size={24} />
              <span>
                {contest.participants.length} Participants
              </span>
            </div>

            <div className="flex items-center text-gray-600">
              <Trophy className="mr-3 text-primary-500" size={24} />
              <span className="capitalize">
                Difficulty: {contest.quiz.difficulty || 'Medium'}
              </span>
            </div>
          </div>

          {currUserRole === 'student' && (
            <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-all">
              Participate in Contest
            </button>
          )}
        </div>

        {/* Participants Leaderboard */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Participants Leaderboard
          </h2>
          
          {contest.participants.length > 0 ? (
            <div className="space-y-2">
              {renderParticipantsList()}
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg">
              No participants yet
            </div>
          )}
          </div>
      </div>

      {/* Quiz Details Section */}
      {currUserRole !== 'student' && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Quiz Configuration
          </h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Total Questions</h3>
                <p className="text-gray-600">
                  {contest.quiz.questions ? contest.quiz.questions.length : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Quiz Duration</h3>
                <p className="text-gray-600">
                  {Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / 60000)} minutes
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Quiz Category</h3>
                <p className="text-gray-600 capitalize">
                  {contest.quiz.category?.name || 'Uncategorized'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Created By</h3>
                <p className="text-gray-600">
                  {contest.quiz.createdBy?.name || 'System'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestDetails;