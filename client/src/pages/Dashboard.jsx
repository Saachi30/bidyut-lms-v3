

import React, { useState, useEffect } from 'react';
import { Settings, Plus, BookOpen, UserPlus, FileBarChart, Book, Cpu, Trophy, Brain, Users, School, Award, User } from 'lucide-react';
import WelcomeAnimation from '../components/WelcomeAnimation';
import { Link } from 'react-router-dom';
import QuizSection from './Quiz/AIQuizSection';
import JoinQuizModal from '../components/JoinQuizModal';
import CreateQuizModal from '../components/CreateQuizModal';

const Dashboard = ({ currUserRole }) => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showJoinQuizModal, setShowJoinQuizModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);

  const handleJoinQuiz = () => {
    setShowJoinQuizModal(true);
  };

  const handleCreateQuiz = () => {
    setShowCreateQuizModal(true);
  };

  useEffect(() => {
    // Check if the welcome animation has been shown
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');

    if (!hasShownWelcome) {
      // Show the animation and set the flag in localStorage
      setShowPreloader(true);
      localStorage.setItem('hasShownWelcome', 'true');
    } else {
      setShowPreloader(false);
    }

    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  // Define role-specific stats
  const getRoleStats = () => {
    const commonStats = [
      { label: 'Quiz Competitions', value: '100+', icon: Trophy, highlight: true }
    ];

    switch (currUserRole) {
      case 'admin':
        return [
          { label: 'Total Students', value: '4,500+', icon: User },
          { label: 'Active Courses', value: '25+', icon: Book },
          ...commonStats,
          { label: 'Institutes', value: '12+', icon: School }
        ];
      case 'institute':
        return [
          { label: 'Total Students', value: '850+', icon: User },
          { label: 'Active Courses', value: '15+', icon: Book },
          ...commonStats,
          { label: 'Faculties', value: '30+', icon: Users }
        ];
      case 'faculty':
        return [
          { label: 'My Students', value: '120+', icon: User },
          { label: 'My Courses', value: '8+', icon: Book },
          ...commonStats,
          { label: 'Hours of Teaching', value: '350+', icon: Book }
        ];
      case 'student':
      default:
        return [
          { label: 'Enrolled Courses', value: '5+', icon: Book },
          { label: 'Hours of Learning', value: '120+', icon: Book },
          ...commonStats,
          { label: 'Certificates', value: '3+', icon: Award }
        ];
    }
  };

  const getRoleQuickActions = () => {
    // Common action for all roles
    const quizAction = {
      title: 'Start Quiz',
      icon: Brain,
      color: 'from-purple-50 to-purple-100',
      hoverColor: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-500',
      description: 'Practice or compete!',
      special: true,
      onClick: () => setShowQuiz(true)
    };
  
    
    
    
    
    // Join Quiz action for students
    const joinQuizAction = {
      title: 'Join Quiz',
      icon: Trophy,
      color: 'from-amber-50 to-amber-100',
      hoverColor: 'from-amber-100 to-amber-200',
      iconColor: 'text-amber-500',
      description: 'Join a quiz by code',
      onClick: handleJoinQuiz
    };
  
    // Create Quiz action for admin, institute, and faculty
    const createQuizAction = {
      title: 'Create Quiz',
      icon: Book,
      color: 'from-amber-50 to-amber-100',
      hoverColor: 'from-amber-100 to-amber-200',
      iconColor: 'text-amber-500',
      description: 'Create a new quiz',
      onClick: handleCreateQuiz
    };
  
    // Base actions for all roles
    const baseActions = [quizAction];
  
    switch (currUserRole) {
      case 'admin':
        return [
          {
            title: 'Add Institute',
            icon: School,
            color: 'from-blue-50 to-blue-100',
            hoverColor: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-500',
            description: 'Register new institute'
          },
          {
            title: 'Add Course',
            icon: BookOpen,
            color: 'from-emerald-50 to-emerald-100',
            hoverColor: 'from-emerald-100 to-emerald-200',
            iconColor: 'text-emerald-500',
            description: 'Create a new course'
          },
          createQuizAction,
          ...baseActions
        ];
      case 'institute':
        return [
          {
            title: 'Add Faculty',
            icon: Users,
            color: 'from-blue-50 to-blue-100',
            hoverColor: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-500',
            description: 'Register new faculty'
          },
          {
            title: 'Add Course',
            icon: BookOpen,
            color: 'from-emerald-50 to-emerald-100',
            hoverColor: 'from-emerald-100 to-emerald-200',
            iconColor: 'text-emerald-500',
            description: 'Create a new course'
          },
          createQuizAction,
          ...baseActions
        ];
      case 'faculty':
        return [
          {
            title: 'Add Student',
            icon: UserPlus,
            color: 'from-blue-50 to-blue-100',
            hoverColor: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-500',
            description: 'Register new student'
          },
          {
            title: 'Add Course',
            icon: BookOpen,
            color: 'from-emerald-50 to-emerald-100',
            hoverColor: 'from-emerald-100 to-emerald-200',
            iconColor: 'text-emerald-500',
            description: 'Create a new course'
          },
          createQuizAction,
          ...baseActions
        ];
      case 'student':
      default:
        return [
          {
            title: 'My Courses',
            icon: Book,
            color: 'from-blue-50 to-blue-100',
            hoverColor: 'from-blue-100 to-blue-200',
            iconColor: 'text-blue-500',
            description: 'View enrolled courses'
          },
          {
            title: 'Certificates',
            icon: Award,
            color: 'from-emerald-50 to-emerald-100',
            hoverColor: 'from-emerald-100 to-emerald-200',
            iconColor: 'text-emerald-500',
            description: 'View your achievements'
          },
          joinQuizAction,
          ...baseActions
        ];
    }
  };

  // Use the role-specific data
  const stats = getRoleStats();
  const quickActions = getRoleQuickActions();

  // Render button text based on role
  const getNewButtonText = () => {
    switch (currUserRole) {
      case 'admin':
        return 'New Institute';
      case 'institute':
        return 'New Faculty';
      case 'faculty':
        return 'New Course';
      case 'student':
      default:
        return 'Notifications';
    }
  };

  // Get role-specific redirect path for the "New" button
  const getNewButtonPath = () => {
    switch (currUserRole) {
      case 'admin':
        return '/lms/institutes/new';
      case 'institute':
        return '/lms/faculties/new';
      case 'faculty':
        return '/lms/scourses';
      case 'student':
      default:
        return '/lms/scourses';
    }
  };

  if (showQuiz) {
    return <QuizSection onClose={() => setShowQuiz(false)} />;
  }

  return (
    <>
      {showPreloader && <WelcomeAnimation />}
      {showJoinQuizModal && <JoinQuizModal onClose={() => setShowJoinQuizModal(false)} />}
      {showCreateQuizModal && <CreateQuizModal onClose={() => setShowCreateQuizModal(false)} />}
      <div className="p-8 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-ternary-500">
            Dashboard
          </h1>
          <div className="flex space-x-4">
            <Link to='/lms/profile'>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl transition-all duration-300">
                Profile
              </button>
            </Link>
            <Link to={getNewButtonPath()}>
              <button className="px-6 py-3 bg-ternary-500 text-white rounded-xl transition-all duration-300">
                {getNewButtonText()}
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 
                ${stat.highlight 
                  ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100' 
                  : 'border-transparent hover:border-secondary-200'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-gray-500 mb-2">{stat.label}</h3>
                {stat.highlight && (
                  <div className="animate-pulse">
                    <Trophy className="text-purple-500" size={20} />
                  </div>
                )}
              </div>
              <p className={`text-3xl font-bold ${stat.highlight 
                ? 'text-purple-600' 
                : 'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h3>
            <div className="space-y-4">
              {/* Role-specific activities */}
              {currUserRole === 'admin' && (
                <>
                  <ActivityItem icon={School} title="New Institute Registered" description="ABC Institute joined the platform" />
                  <ActivityItem icon={BookOpen} title="New Course Added" description="Advanced Machine Learning" />
                  <ActivityItem icon={Users} title="Faculty Access Updated" description="Updated permissions for 3 faculties" />
                  <ActivityItem icon={Settings} title="System Update" description="Platform updated to version 2.5" />
                </>
              )}
              
              {currUserRole === 'institute' && (
                <>
                  <ActivityItem icon={Users} title="New Faculty Added" description="Dr. John Smith joined your institute" />
                  <ActivityItem icon={BookOpen} title="New Course Published" description="Web Development Fundamentals" />
                  <ActivityItem icon={User} title="Student Enrollment" description="15 new students enrolled" />
                  <ActivityItem icon={Settings} title="Institute Settings Updated" description="Profile information updated" />
                </>
              )}
              
              {currUserRole === 'faculty' && (
                <>
                  <ActivityItem icon={Book} title="Course Updated" description="Python Programming syllabus updated" />
                  <ActivityItem icon={User} title="Assignment Submission" description="5 students submitted assignments" />
                  <ActivityItem icon={Trophy} title="Quiz Created" description="New quiz added to Data Structures" />
                  <ActivityItem icon={FileBarChart} title="Grades Updated" description="Published grades for 2 courses" />
                </>
              )}
              
              {currUserRole === 'student' && (
                <>
                  <ActivityItem icon={Book} title="New Lesson Available" description="JavaScript Advanced Concepts" />
                  <ActivityItem icon={Trophy} title="Quiz Completed" description="Scored 92% in Database Quiz" />
                  <ActivityItem icon={Award} title="Certificate Earned" description="Web Development Basics completed" />
                  <ActivityItem icon={FileBarChart} title="Progress Updated" description="60% completed in Python course" />
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`group relative flex flex-col items-center justify-center p-6 h-40 text-center 
                    bg-gradient-to-br ${action.color} rounded-2xl shadow-sm
                    hover:shadow-md transition-all duration-300 hover:${action.hoverColor} 
                    transform hover:-translate-y-1 
                    ${action.special ? 'ring-2 ring-purple-400 ring-offset-2' : ''}`}
                >
                  <div className={`mb-3 ${action.iconColor} bg-white p-3 rounded-xl shadow-sm 
                    group-hover:scale-110 transition-transform duration-300 
                    ${action.special ? 'animate-bounce' : ''}`}>
                    <action.icon size={28} />
                  </div>
                  <h4 className="font-semibold text-gray-700 mb-1">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {action.description}
                  </p>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Plus size={16} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper component for activity items
const ActivityItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
      <Icon className="text-cyan-500" size={20} />
    </div>
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default Dashboard;