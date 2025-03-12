// import { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import HomePage from './pages/HomePage';
// import AboutUs from './pages/AboutUs';
// import Login from './pages/LMS/Login';
// import Dashboard from './pages/LMS/Dashboard';
// import Categories from './pages/LMS/Categories';
// import Courses from './pages/LMS/Courses';
// import Institutes from './pages/LMS/Institutes';
// import LMSLayout from './components/LMSLayout';
// import Robots from './pages/Robots';
// import StudentProfile from './pages/LMS/Profile';
// import QuizSection from './pages/QuizSection.jsx';
// import BidyutForSchool from './pages/BidyutForSchool.jsx';
// import { RobotProvider } from './RobotContext';
// import Footer from './components/Footer.jsx';
// import 'leaflet/dist/leaflet.css';

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//   };
//   const location = useLocation();
//   const shouldShowNavbar = !location.pathname.startsWith('/lms/');
//   return (
//   <>
//   <RobotProvider>
//        {shouldShowNavbar && <Navbar />}
//       <Routes>

//         {/* Public routes with Navbar */}
//         <Route
//           path="/"
//           element={
//             <>
//               <HomePage />
//             </>
//           }
//         />
//         <Route path="/about" element={<AboutUs/>} />
//         <Route path='/robots' element={<Robots/>}/>
//         <Route path='/schools' element={<BidyutForSchool/>}/>

//         {/* Login route - no navbar */}
//         <Route
//           path="/login"
//           element={
//             isAuthenticated ?
//             <Navigate to="/lms/dashboard" /> :
//             <Login onLogin={handleLogin} />
//           }
//         />

//         {/* Protected LMS routes - wrapped in LMSLayout */}
//         <Route element={<LMSLayout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
//           <Route
//             path="/lms/dashboard"
//             element={<Dashboard />}
//           />
//           <Route
//             path="/lms/categories"
//             element={<Categories />}
//           />
//           <Route
//             path="/lms/courses"
//             element={<Courses />}
//           />
//           <Route
//             path="/lms/institutes"
//             element={<Institutes />}
//           />
//           <Route
//             path='/lms/profile'
//             element={<StudentProfile/>}
//           />
//           <Route
//             path="/lms/quiz/:courseId"
//             element={<QuizSection/>}
//           />
//         </Route>
//       </Routes>

//       {shouldShowNavbar && <Footer />}
//       </RobotProvider>
// </>
//   );
// }

// export default App;

// App.jsx

// import React, { useEffect, useRef } from 'react';
// import Spline from '@splinetool/react-spline';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import './App.css';

// gsap.registerPlugin(ScrollTrigger);

// export default function App() {
//   const splineRef = useRef();
//   const contentRef = useRef();

//   const onLoad = (spline) => {
//     splineRef.current = spline;
//     // Initial animation
//     gsap.from(spline.rotation, {
//       y: Math.PI * 2,
//       duration: 2,
//       ease: "power2.out"
//     });
//   };

//   useEffect(() => {
//     // Scroll animations
//     const sections = document.querySelectorAll('.section');

//     sections.forEach((section, index) => {
//       gsap.fromTo(section,
//         { opacity: 0, y: 50 },
//         {
//           scrollTrigger: {
//             trigger: section,
//             start: "top center",
//             end: "bottom center",
//             toggleActions: "play none none reverse"
//           },
//           opacity: 1,
//           y: 0,
//           duration: 1,
//           delay: index * 0.2
//         }
//       );
//     });

//     // Scroll indicator animation
//     gsap.to('.scroll-indicator', {
//       opacity: 0,
//       y: 20,
//       duration: 1,
//       scrollTrigger: {
//         trigger: contentRef.current,
//         start: "top top",
//         end: "100 top",
//         scrub: true
//       }
//     });

//     // Model rotation on scroll
//     if (splineRef.current) {
//       gsap.to(splineRef.current.rotation, {
//         scrollTrigger: {
//           trigger: contentRef.current,
//           start: "top top",
//           end: "bottom bottom",
//           scrub: 1
//         },
//         y: Math.PI * 4,
//         x: Math.PI * 0.5
//       });
//     }
//   }, []);

//   return (
//     <>
//       <div className="spline-container">
//         <Spline
//           scene="https://prod.spline.design/VpxshsoUq0Od8bH8/scene.splinecode"
//           onLoad={onLoad}
//         />
//       </div>

//       <nav className="nav">
//         <a href="#" className="logo">YOUR LOGO</a>
//       </nav>

//       <div className="scroll-indicator">Scroll to explore</div>

//       <main className="content" ref={contentRef}>
//         <section className="section">
//           <h1 className="title">WELCOME</h1>
//           <p className="subtitle">Interactive Digital Experiences</p>
//         </section>

//         <section className="section">
//           <h2 className="title">INNOVATION</h2>
//           <p className="subtitle">Pushing boundaries in digital design</p>
//         </section>

//         <section className="section">
//           <h2 className="title">CREATIVITY</h2>
//           <p className="subtitle">Where imagination meets technology</p>
//         </section>
//       </main>
//     </>
//   );
// }

// import React, { useState, useEffect } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
// } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";

// // Components
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import BidyutLogo from "./components/Loader";
// import LMSLayout from "./components/LMSLayout";

// // Pages
// import HomePage from "./pages/HomePage";
// import Login from "./pages/LMS/Login";
// import Dashboard from "./pages/LMS/Dashboard";
// import Categories from "./pages/LMS/Categories";
// import Courses from "./pages/LMS/Courses";
// import Institutes from "./pages/LMS/Institutes";
// import StudentProfile from "./pages/LMS/Profile";
// import QuizSection from "./pages/LMS/QuizSection";
// import BidyutForSchool from "./pages/BidyutForSchool";
// import OurProducts from "./pages/OurProducts";
// import ContactForm from "./pages/ContactForm";
// import AboutPage from "./pages/AboutUs/AboutPage";

// // Context
// import { RobotProvider } from "./components/RobotContext";
// import InstituteCategories from "./pages/LMS/Institute/InstituteCategories";
// import InstituteCourse from "./pages/LMS/Institute/InstituteCourse";
// import InstituteFaculties from "./pages/LMS/Institute/InstituteFaculties";
// import InstituteStudents from "./pages/LMS/Institute/InstituteStudents";
// import InstituteDashboard from "./pages/LMS/Institute/InstituteDashboard";
// import InstituteLayout from "./pages/LMS/Institute/InstituteLayout";
// import FacultyLayout from "./pages/LMS/Faculty/FacultyLayout";
// import FacultyCategories from "./pages/LMS/Faculty/FacultyCategories";
// import FacultyDashboard from "./pages/LMS/Faculty/FacultyDashboard";
// import FacultyCourse from "./pages/LMS/Faculty/FacultyCourse";
// import FacultyStudent from "./pages/LMS/Faculty/FacultyStudent";

// const AppContent = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showLoader, setShowLoader] = useState(true);
//   const [showMainContent, setShowMainContent] = useState(false);
//   const location = useLocation();

//   const shouldShowNavbar = !location.pathname.startsWith("/lms/");

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//   };

//   useEffect(() => {
//     // Show loader for initial animation duration
//     const loaderTimer = setTimeout(() => {
//       setShowLoader(false);
//     }, 6500);

//     // Add a small delay before showing main content for smooth transition
//     const contentTimer = setTimeout(() => {
//       setShowMainContent(true);
//     }, 7000);

//     return () => {
//       clearTimeout(loaderTimer);
//       clearTimeout(contentTimer);
//     };
//   }, []);

//   return (
//     <div className="relative">
//       <AnimatePresence mode="wait">
//         {showLoader && (
//           <motion.div
//             className="fixed inset-0 z-50"
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <BidyutLogo />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {showMainContent && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <RobotProvider>
//             {shouldShowNavbar && <Navbar />}

//             <Routes>
//               {/* Public routes with Navbar */}
//               <Route path="/" element={<HomePage />} />
//               <Route path="/schools" element={<BidyutForSchool />} />
//               <Route path="/robots-industry" element={<OurProducts />} />
//               <Route path="/contact" element={<ContactForm />} />
//               <Route path="/about" element={<AboutPage />} />
//               <Route
//                 path="/institutedashboard"
//                 element={
//                   <InstituteLayout>
//                     <InstituteDashboard />
//                   </InstituteLayout>
//                 }
//               />

//               <Route
//                 path="/institutecategories"
//                 element={
//                   <InstituteLayout>
//                     <InstituteCategories />
//                   </InstituteLayout>
//                 }
//               />
//               <Route path="/institutecourses" element={<InstituteLayout><InstituteCourse /></InstituteLayout>} />
//               <Route
//                 path="/institutefaculties"
//                 element={<InstituteLayout><InstituteFaculties /></InstituteLayout>}
//               />
//               <Route
//                 path="/institutestudents"
//                 element={<InstituteLayout><InstituteStudents /></InstituteLayout>}
//               />

//               <Route
//               path="/facultydashboard"
//               element={<FacultyLayout><FacultyDashboard/></FacultyLayout>}
//               />
//               <Route
//               path="/facultycategories"
//               element={<FacultyLayout><FacultyCategories/></FacultyLayout>}
//               />
//               <Route
//               path="/facultycourses"
//               element={<FacultyLayout><FacultyCourse/></FacultyLayout>}
//               />
//               <Route
//               path="/facultystudents"
//               element={<FacultyLayout><FacultyStudent/></FacultyLayout>}
//               />

//               {/* Login route - no navbar */}
//               <Route
//                 path="/login"
//                 element={
//                   isAuthenticated ? (
//                     <Navigate to="/lms/dashboard" />
//                   ) : (
//                     <Login onLogin={handleLogin} />
//                   )
//                 }
//               />

//               {/* Protected LMS routes - wrapped in LMSLayout */}
//               <Route
//                 element={
//                   <LMSLayout
//                     isAuthenticated={isAuthenticated}
//                     onLogout={handleLogout}
//                   />
//                 }
//               >
//                 <Route path="/lms/dashboard" element={<Dashboard />} />
//                 <Route path="/lms/categories" element={<Categories />} />
//                 <Route path="/lms/courses" element={<Courses />} />
//                 <Route path="/lms/institutes" element={<Institutes />} />
//                 <Route path="/lms/profile" element={<StudentProfile />} />
//                 <Route path="/lms/quiz/:courseId" element={<QuizSection />} />
//               </Route>
//             </Routes>

//             {shouldShowNavbar && <Footer />}
//           </RobotProvider>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// const App = () => {
//   return <AppContent />;
// };

// export default App;

// import React, { useState, useEffect } from "react";
// import {
//   Routes,
//   Route,
//   Navigate,
//   useLocation,
//   useNavigate
// } from "react-router-dom";
// import { AnimatePresence, motion } from "framer-motion";
// import axios from "axios";

// // Components
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import BidyutLogo from "./components/Loader";
// import LMSLayout from "./components/LMSLayout";

// // Pages
// import HomePage from "./pages/HomePage";
// import Login from "./pages/LMS/Login";
// import Dashboard from "./pages/LMS/Dashboard";
// import Categories from "./pages/LMS/Categories";
// import Courses from "./pages/LMS/Courses";
// import Institutes from "./pages/LMS/Institutes";
// import StudentProfile from "./pages/LMS/Profile";
// import QuizSection from "./pages/LMS/QuizSection";
// import BidyutForSchool from "./pages/BidyutForSchool";
// import OurProducts from "./pages/OurProducts";
// import ContactForm from "./pages/ContactForm";
// import AboutPage from "./pages/AboutUs/AboutPage";

// // Context
// import { RobotProvider } from "./components/RobotContext";
// import InstituteCategories from "./pages/LMS/Institute/InstituteCategories";
// import InstituteCourse from "./pages/LMS/Institute/InstituteCourse";
// import InstituteFaculties from "./pages/LMS/Institute/InstituteFaculties";
// import InstituteStudents from "./pages/LMS/Institute/InstituteStudents";
// import InstituteDashboard from "./pages/LMS/Institute/InstituteDashboard";
// import InstituteLayout from "./pages/LMS/Institute/InstituteLayout";
// import FacultyLayout from "./pages/LMS/Faculty/FacultyLayout";
// import FacultyCategories from "./pages/LMS/Faculty/FacultyCategories";
// import FacultyDashboard from "./pages/LMS/Faculty/FacultyDashboard";
// import FacultyCourse from "./pages/LMS/Faculty/FacultyCourse";
// import FacultyStudent from "./pages/LMS/Faculty/FacultyStudent";
// import SCourses from "./pages/LMS/Students/SCources";
// import SCDetails from "./pages/LMS/Students/SCDetails";
// import GTranslate from "./components/GTranslate";
// import Contests from "./pages/LMS/Quiz/ContestsPage";
// import QuizPage from "./pages/LMS/Quiz/CoursesQuiz";

// // Configure axios defaults
// axios.defaults.baseURL = 'http://localhost:5000';
// axios.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [showLoader, setShowLoader] = useState(true);
//   const [showMainContent, setShowMainContent] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Role state
//   const [currUserRole, setCurrUserRole] = useState("");

//   // Updated condition to exclude both /lms/ and institute pages
//   const shouldShowNavbar = !location.pathname.startsWith("/lms/") &&
//                           !location.pathname.startsWith("/institute") &&
//                           ![
//                             "/login",
//                             "/institutedashboard",
//                             "/institutecategories",
//                             "/institutecourses",
//                             "/institutefaculties",
//                             "/institutestudents",
//                             "/facultydashboard",
//                             "/facultycategories",
//                             "/facultycourses",
//                             "/facultystudents"
//                           ].includes(location.pathname);

//   // Check for existing token and user data on initial load
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const user = JSON.parse(localStorage.getItem('user'));

//     if (token && user) {
//       setIsAuthenticated(true);
//       setCurrUserRole(user.role);

//       // Verify token validity with backend
//       axios.get('/api/auth/me')
//         .catch(() => {
//           // If token is invalid, log the user out
//           handleLogout();
//         });
//     }
//   }, []);

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//     // Role state is set in the Login component
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setIsAuthenticated(false);
//     setCurrUserRole("");
//     navigate('/login');
//   };

//   useEffect(() => {
//     // Show loader for initial animation duration
//     const loaderTimer = setTimeout(() => {
//       setShowLoader(false);
//     }, 6500);

//     // Add a small delay before showing main content for smooth transition
//     const contentTimer = setTimeout(() => {
//       setShowMainContent(true);
//     }, 7000);

//     return () => {
//       clearTimeout(loaderTimer);
//       clearTimeout(contentTimer);
//     };
//   }, []);

//   // Protected route component
//   const ProtectedRoute = ({ children, allowedRoles = [] }) => {
//     if (!isAuthenticated) {
//       return <Navigate to="/login" />;
//     }

//     // If allowedRoles is empty or includes the current user's role, render the children
//     if (allowedRoles.length === 0 || allowedRoles.includes(currUserRole)) {
//       return children;
//     }

//     // Redirect to appropriate dashboard if role doesn't match
//     switch (currUserRole) {
//       case 'admin':
//         return <Navigate to="/lms/dashboard" />;
//       case 'institute':
//         return <Navigate to="/institutedashboard" />;
//       case 'faculty':
//         return <Navigate to="/facultydashboard" />;
//       case 'student':
//       default:
//         return <Navigate to="/lms/dashboard" />;
//     }
//   };

//   return (
//     <div className="relative">
//       <AnimatePresence mode="wait">
//         {showLoader && (
//           <motion.div
//             className="fixed inset-0 z-50"
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <BidyutLogo />
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {showMainContent && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <GTranslate />
//           <RobotProvider>
//             {shouldShowNavbar && <Navbar />}

//             <Routes>
//               {/* Public routes with Navbar */}
//               <Route path="/" element={<HomePage />} />
//               <Route path="/schools" element={<BidyutForSchool />} />
//               <Route path="/robots-industry" element={<OurProducts />} />
//               <Route path="/contact" element={<ContactForm />} />
//               <Route path="/about" element={<AboutPage />} />

//               {/* Institute routes - protected for institute and admin roles */}
//               <Route path="/institutedashboard" element={
//                 <ProtectedRoute allowedRoles={['institute', 'admin']}>
//                   <InstituteLayout>
//                     <InstituteDashboard />
//                   </InstituteLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/institutecategories" element={
//                 <ProtectedRoute allowedRoles={['institute', 'admin']}>
//                   <InstituteLayout>
//                     <InstituteCategories />
//                   </InstituteLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/institutecourses" element={
//                 <ProtectedRoute allowedRoles={['institute', 'admin']}>
//                   <InstituteLayout>
//                     <InstituteCourse />
//                   </InstituteLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/institutefaculties" element={
//                 <ProtectedRoute allowedRoles={['institute', 'admin']}>
//                   <InstituteLayout>
//                     <InstituteFaculties />
//                   </InstituteLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/institutestudents" element={
//                 <ProtectedRoute allowedRoles={['institute', 'admin']}>
//                   <InstituteLayout>
//                     <InstituteStudents />
//                   </InstituteLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Faculty routes - protected for faculty roles */}
//               <Route path="/facultydashboard" element={
//                 <ProtectedRoute allowedRoles={['faculty', 'admin']}>
//                   <FacultyLayout>
//                     <FacultyDashboard />
//                   </FacultyLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/facultycategories" element={
//                 <ProtectedRoute allowedRoles={['faculty', 'admin']}>
//                   <FacultyLayout>
//                     <FacultyCategories />
//                   </FacultyLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/facultycourses" element={
//                 <ProtectedRoute allowedRoles={['faculty', 'admin']}>
//                   <FacultyLayout>
//                     <FacultyCourse />
//                   </FacultyLayout>
//                 </ProtectedRoute>
//               } />
//               <Route path="/facultystudents" element={
//                 <ProtectedRoute allowedRoles={['faculty', 'admin']}>
//                   <FacultyLayout>
//                     <FacultyStudent />
//                   </FacultyLayout>
//                 </ProtectedRoute>
//               } />

//               {/* Login route - redirect to dashboard if already authenticated */}
//               <Route
//                 path="/login"
//                 element={
//                   isAuthenticated ? (
//                     <Navigate to={
//                       currUserRole === 'institute' ? '/institutedashboard' :
//                       currUserRole === 'faculty' ? '/facultydashboard' :
//                       '/lms/dashboard'
//                     } />
//                   ) : (
//                     <Login onLogin={handleLogin} currUserRole={currUserRole} setCurrUserRole={setCurrUserRole} />
//                   )
//                 }
//               />

//               {/* Protected LMS routes - wrapped in LMSLayout */}
//               <Route
//                 element={
//                   <ProtectedRoute>
//                     <LMSLayout
//                       isAuthenticated={isAuthenticated}
//                       onLogout={handleLogout}
//                       userRole={currUserRole}
//                     />
//                   </ProtectedRoute>
//                 }
//               >
//                 <Route path="/lms/dashboard" element={<Dashboard />} />
//                 <Route path="/lms/categories" element={<Categories />} />
//                 <Route path="/lms/courses" element={<Courses />} />
//                 <Route path="/lms/institutes" element={<Institutes />} />
//                 <Route path="/lms/profile" element={<StudentProfile />} />
//                 <Route path="/lms/quiz/:courseId" element={<QuizSection />} />
//                 <Route path="/lms/scourses" element={<SCourses />} />
//                 <Route path="/lms/coursedetail/grade-6" element={<SCDetails />} />
//                 <Route path="/lms/contests" element={<Contests />} />
//                 <Route path="/lms/quiz" element={<QuizPage />} />
//               </Route>

//               {/* Catch-all redirect */}
//               <Route path="*" element={<Navigate to="/" replace />} />
//             </Routes>

//             {shouldShowNavbar && <Footer />}
//           </RobotProvider>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

// Components
import LMSLayout from "./components/LMSLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Courses from "./pages/Courses";
import Institutes from "./pages/Institutes";
import Profile from "./pages/Profile";
import QuizSection from "./pages/QuizSection";
import SCourses from "./pages/SCources";
import SCDetails from "./pages/SCDetails";
import Contests from "./pages/Quiz/ContestsPage";
import QuizPage from "./pages/Quiz/CoursesQuiz";
import Students from "./pages/Students";
import Faculties from "./pages/Faculties";
import EnrollmentManagement from "./pages/Enrollments";
import Subtopics from "./pages/SubTopics";
import QuizAttempt from "./pages/Quiz/QuizAttempt";
import QuizResults from "./pages/Quiz/QuizResults";


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Configure axios defaults
axios.defaults.baseURL =  import.meta.env.VITE_BASE_URL;
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currUserRole, setCurrUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setIsAuthenticated(true);
      setCurrUserRole(user.role);

      axios.get("/api/auth/me").catch(() => {
        handleLogout();
      });
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setCurrUserRole("");
    navigate("/login");
  };

  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (allowedRoles.length === 0 || allowedRoles.includes(currUserRole)) {
      return children;
    }

    return <Navigate to="/lms/dashboard" />;
  };

  return (
    <div className="relative">
  
        <ScrollToTop />
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/lms/dashboard" />
              ) : (
                <Login
                  onLogin={handleLogin}
                  currUserRole={currUserRole}
                  setCurrUserRole={setCurrUserRole}
                />
              )
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <LMSLayout
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                  userRole={currUserRole}
                />
              </ProtectedRoute>
            }
          >
            <Route
              path="/lms/dashboard"
              element={<Dashboard currUserRole={currUserRole} />}
            />
            <Route
              path="/lms/categories"
              element={<Categories currUserRole={currUserRole} />}
            />
            <Route
              path="/lms/courses"
              element={<Courses userRole={currUserRole} />}
            />
            <Route
              path="/lms/coursedetail/:courseId"
              element={
                <ProtectedRoute>
                  <Subtopics currUserRole={currUserRole} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms/students"
              element={
                <ProtectedRoute allowedRoles={["faculty", "institute", "admin"]}>
                  <Students currUserRole={currUserRole} viewType="students" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms/enrollments"
              element={
                <ProtectedRoute allowedRoles={["faculty", "institute", "admin"]}>
                  <EnrollmentManagement userRole={currUserRole} viewType="students" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms/faculties"
              element={
                <ProtectedRoute allowedRoles={["institute", "admin"]}>
                  <Faculties currUserRole={currUserRole} viewType="faculties" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms/institutes"
              element={
                <ProtectedRoute allowedRoles={["student", "admin"]}>
                  <Institutes userRole={currUserRole} />
                </ProtectedRoute>
              }
            />
            <Route path="/lms/profile" element={<Profile />} />
            <Route
              path="/lms/scourses"
              element={
                <ProtectedRoute allowedRoles={["student", "admin"]}>
                  <SCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lms/coursedetail/grade-6"
              element={
                <ProtectedRoute allowedRoles={["student", "admin"]}>
                  <SCDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/lms/contests" element={<Contests currUserRole={currUserRole} />} />
            <Route path="/lms/quiz/:id" element={<QuizPage currUserRole={currUserRole} />} />
            <Route path="/lms/quiz-attempt/:id" element={<QuizAttempt />} />
            <Route path="/lms/quiz-results/:id" element={<QuizResults />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

    </div>
  );
};

export default App;