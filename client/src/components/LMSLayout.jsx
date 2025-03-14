import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const LMSLayout = ({ isAuthenticated, onLogout, userRole }) => {
  // Store sidebar state in localStorage to persist across navigation
  const getInitialSidebarState = () => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    // Default to open on desktop, closed on mobile
    return window.innerWidth >= 768;
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Only auto-adjust sidebar state on initial load, not on every resize
      if (!localStorage.getItem('sidebarState')) {
        setIsSidebarOpen(!mobile);
      }
    };

    // Initial check
    checkIfMobile();
    
    // Event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Mobile menu toggle button - only visible on mobile */}
      {isMobile && !isSidebarOpen && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 bg-white rounded-lg shadow-lg hover:bg-primary-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-primary-600" />
          </button>
        </div>
      )}
      
      {/* Overlay when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar component */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={onLogout}
        userRole={userRole}
        isMobile={isMobile}
      />
      
      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isMobile
            ? 'ml-0' // On mobile, main content takes full width
            : isSidebarOpen
              ? 'ml-64' // Standard desktop with open sidebar
              : 'ml-20'  // Standard desktop with collapsed sidebar
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default LMSLayout;