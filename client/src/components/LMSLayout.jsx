import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const LMSLayout = ({ isAuthenticated, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
  
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={onLogout}
        />
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-20'
          }`}
        >
          <Outlet />
        </main>
      </div>
    );
  };

export default LMSLayout;