import React, { useEffect, useState } from 'react';
import { Home, Book, BookOpen, School, LogOut, Menu, Users, User, Award, Trophy, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ isOpen, toggleSidebar, onLogout, userRole: propUserRole, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(propUserRole || '');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user')) || {};
    setUserRole(userData.role || propUserRole || 'student');
    setUserName(userData.name || 'User');
  }, [propUserRole]);

  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { icon: Home, label: 'Dashboard', path: '/lms/dashboard' },
      { icon: Trophy, label: 'Contests', path: '/lms/contests' }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...commonItems,
          { icon: BookOpen, label: 'Categories', path: '/lms/categories' },
          { icon: Book, label: 'Courses', path: '/lms/courses' },
          { icon: School, label: 'Institutes', path: '/lms/institutes' },
          { icon: Users, label: 'Faculties', path: '/lms/faculties' },
          { icon: User, label: 'Students', path: '/lms/students' },
        ];
      case 'institute':
        return [
          ...commonItems,
          { icon: BookOpen, label: 'Categories', path: '/lms/categories' },
          { icon: Book, label: 'Courses', path: '/lms/courses' },
          { icon: Users, label: 'Faculties', path: '/lms/faculties' },
          { icon: User, label: 'Students', path: '/lms/students' }
        ];
      case 'faculty':
        return [
          ...commonItems,
          { icon: BookOpen, label: 'Categories', path: '/lms/categories' },
          { icon: Book, label: 'Courses', path: '/lms/courses' },
          { icon: User, label: 'Students', path: '/lms/students' }
        ];
      case 'student':
      default:
        return [
          ...commonItems,
          { icon: BookOpen, label: 'Categories', path: '/lms/categories' },
          { icon: Book, label: 'Courses', path: '/lms/courses' },
          { icon: Award, label: 'Profile', path: '/lms/profile' }
        ];
    }
  };

  const baseURL = import.meta.env.VITE_BASE_URL;
  const handleLogout = async () => {
    try {
      // Call the logout API
      await axios.post(`${baseURL}api/auth/logout`);
      
      // Remove user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hasShownWelcome'); // Clear the welcome animation flag
      localStorage.removeItem('sidebarState'); // Clear sidebar state
      
      // Call the onLogout callback
      if (onLogout) onLogout();
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
      
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('hasShownWelcome');
      localStorage.removeItem('sidebarState');
      if (onLogout) onLogout();
      navigate('/login');
    }
  };

  // We're intentionally NOT closing the sidebar on navigation
  // as per the user's requirement
  const handleMenuItemClick = () => {
    // No longer closing sidebar on navigation
    // The sidebar state is persisted via localStorage in LMSLayout
    if (isMobile) {
      toggleSidebar(); // Only close on mobile
    }
  };

  // Hide sidebar completely when closed on mobile
  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div 
      className={`fixed top-0 h-full bg-white shadow-xl transition-all duration-300 ${
        isMobile ? 'z-50 left-0 w-5/6 max-w-xs' : 'left-0 z-10'
      }`}
      style={{ 
        width: !isMobile ? (isOpen ? '16rem' : '5rem') : undefined,
        transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex justify-between items-center">
          <h1 className={`text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent ${
            !isOpen && !isMobile ? 'hidden' : ''
          }`}>
            LMS Portal
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isMobile ? <X size={24} className="text-primary-600" /> : <Menu size={24} className="text-primary-600" />}
          </button>
        </div>
        
        {(isOpen || isMobile) && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm text-gray-500">Welcome</div>
            <div className="font-medium truncate">{userName}</div>
            <div className="text-xs text-primary-500 uppercase mt-1">{userRole}</div>
          </div>
        )}
        
        <div className="flex-1 px-4 mt-6 overflow-y-auto">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleMenuItemClick}
                className={`flex items-center ${!isOpen && !isMobile ? 'justify-center' : ''} space-x-4 p-3 rounded-xl mb-2 transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                    : 'hover:bg-gradient-to-r hover:from-primary-100 hover:to-secondary-100'
                }`}
              >
                <Icon size={24} />
                {(isOpen || isMobile) && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4">
          <button
            onClick={handleLogout}
            className={`flex items-center ${!isOpen && !isMobile ? 'justify-center' : ''} space-x-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-300 w-full`}
          >
            <LogOut size={24} />
            {(isOpen || isMobile) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;