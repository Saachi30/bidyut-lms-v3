// import { useState } from 'react';
// import { Outlet, Navigate } from 'react-router-dom';
// import Sidebar from './Sidebar';

// const LMSLayout = ({ isAuthenticated, onLogout }) => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
//     if (!isAuthenticated) {
//       return <Navigate to="/login" />;
//     }
  
//     return (
//       <div className="flex min-h-screen">
//         <Sidebar
//           isOpen={isSidebarOpen}
//           toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//           onLogout={onLogout}
//         />
//         <main 
//           className={`flex-1 transition-all duration-300 ${
//             isSidebarOpen ? 'ml-64' : 'ml-20'
//           }`}
//         >

//           <Outlet />
//         </main>
//       </div>
//     );
//   };

// export default LMSLayout;


import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const LMSLayout = ({ isAuthenticated, onLogout, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();
    
    // Event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Overlay when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onLogout={onLogout}
        userRole={userRole}
      />
      
      <main
        className={`flex-1 transition-all duration-300 ${
          isMobile
            ? 'ml-16' // On mobile, main content takes full width
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