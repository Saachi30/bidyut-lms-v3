import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Trophy, Filter, Search, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContestDetails from '../../components/ContestDetails';
import CreateContestModal from '../../components/CreateContestModal';
import axios from 'axios';

const Contests = ({ currUserRole }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContest, setSelectedContest] = useState(null);
  const [contests, setContests] = useState([]);
  const [isCreateContestModalOpen, setIsCreateContestModalOpen] = useState(false);

  // Fetch contests (would be replaced with actual API call)
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get('/api/contests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setContests(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch contests', error);
        // Optional: Add error handling toast or notification
      }
    };

    fetchContests();
  }, []);

  const handleParticipate = async (contestId) => {
    try {
      const response = await axios.post(`/api/contests/${contestId}/participate`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // TODO: Show success message or update UI
        console.log('Participation successful');
      }
    } catch (error) {
      console.error('Failed to participate', error);
      // Optional: Add error handling toast or notification
    }
  };

  // Filter contests based on tab, filter, and search
  const filteredContests = contests.filter(contest => {
    const now = new Date();
    
    // Filter by subject tab
    if (activeTab !== 'all' && contest.quiz.category.name.toLowerCase() !== activeTab) return false;
    
    // Filter by status
    if (filter === 'upcoming' && contest.startTime <= now) return false;
    if (filter === 'ongoing' && (contest.startTime > now || contest.endTime < now)) return false;
    if (filter === 'past' && contest.endTime > now) return false;
    
    // Filter by search query
    if (searchQuery && !contest.quiz.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  const getStatusColor = (contest) => {
    const now = new Date();
    if (contest.startTime > now) {
      return 'text-amber-500 bg-amber-50';
    } else if (contest.endTime > now) {
      return 'text-emerald-500 bg-emerald-50';
    } else {
      return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (contest) => {
    const now = new Date();
    if (contest.startTime > now) {
      return 'Upcoming';
    } else if (contest.endTime > now) {
      return 'Ongoing';
    } else {
      return 'Ended';
    }
  };

  const getTimeRemaining = (contest) => {
    const now = new Date();
    if (contest.startTime > now) {
      const diffMs = contest.startTime - now;
      const diffDays = Math.floor(diffMs / 86400000);
      const diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      
      if (diffDays > 0) {
        return `Starts in ${diffDays}d ${diffHrs}h`;
      } else {
        return `Starts in ${diffHrs}h`;
      }
    } else if (contest.endTime > now) {
      const diffMs = contest.endTime - now;
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      
      return `Ends in ${diffHrs}h ${diffMins}m`;
    } else {
      return 'Ended';
    }
  };

  // If a contest is selected, show the contest details
  if (selectedContest) {
    return <ContestDetails contest={selectedContest} onBack={handleBackToList} />;
  }

  // Define subject tabs (dynamically populate from categories)
  const subjectTabs = [
    { id: 'all', label: 'All Contests' },
    { id: 'mathematics', label: 'Mathematics' },
    { id: 'physics', label: 'Physics' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'biology', label: 'Biology' },
    { id: 'computer science', label: 'Computer Science' }
  ];

  

  return (
    <div className="p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-ternary-500">
          Contests
        </h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute right-52 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contests..."
              className="pl-10 pr-4 py-3 bg-gray-100 text-gray-700 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Create Contest Button for Admin/Faculty/Institute */}
          {['admin', 'faculty', 'institute'].includes(currUserRole) && (
            <button 
              onClick={() => setIsCreateContestModalOpen(true)}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl transition-all duration-300 hover:bg-primary-600 flex items-center"
            >
              <PlusCircle className="mr-2" size={20} />
              Create Contest
            </button>
          )}
          {currUserRole === 'student' && (
            <button className="px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300 hover:bg-ternary-600">
              My Registrations
            </button>
          )}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {subjectTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>

      {/* Filter Buttons */}
      <div className="flex items-center mb-8 space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'upcoming' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'ongoing' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
              filter === 'past' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'
            }`}
          >
            Past
          </button>
        </div>
        <div className="flex items-center text-gray-500">
          <Filter size={18} className="mr-2" />
          <span>Filter by:</span>
          <select className="ml-2 bg-gray-100 rounded-lg px-3 py-2 text-gray-700 focus:outline-none">
            <option>Difficulty</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
      </div>

      {/* Contests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredContests.length > 0 ? (
          filteredContests.map((contest) => (
            <div
              key={contest.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {contest.quiz.title}
                  </h3>
                  <p className="text-gray-500 line-clamp-2">{contest.quiz.description}</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(contest)}`}>
                  {getStatusText(contest)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-6">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1 text-primary-500" />
                  <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1 text-primary-500" />
                  <span>{getTimeRemaining(contest)}</span>
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1 text-primary-500" />
                  <span>{contest.participants.length} participants</span>
                </div>
                <div className="flex items-center">
                  <Trophy size={16} className="mr-1 text-primary-500" />
                  <span className="capitalize">{contest.quiz.difficulty || 'Medium'}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div 
                  onClick={() => handleContestClick(contest)}
                  className="text-primary-500 flex items-center text-sm font-medium cursor-pointer"
                >
                  View details <ChevronRight size={16} className="ml-1" />
                </div>

                {/* Participate Button for Students */}
                {currUserRole === 'student' && (
                  <button
                    onClick={() => handleParticipate(contest.id)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300"
                  >
                    Participate
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-8 text-center text-gray-500 bg-gray-50 rounded-xl">
            No contests found matching your criteria. Try changing your filters.
          </div>
        )}
      </div>

      {/* Create Contest Modal */}
      {isCreateContestModalOpen && (
        <CreateContestModal 
          onClose={() => setIsCreateContestModalOpen(false)}
          onCreate={(newContest) => {
            setContests([...contests, newContest]);
            setIsCreateContestModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Contests;