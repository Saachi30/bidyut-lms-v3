

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