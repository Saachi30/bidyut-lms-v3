import React, { useState } from 'react';
import { Plus, Settings, X, School, Home, Book, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WelcomeAnimation from '../components/WelcomeAnimation';

const Login = ({ onLogin, currUserRole, setCurrUserRole }) => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    state: '',
    role: 'student', // Default role
    instituteId: null,
    grade: '',
  });

  // Role options with icons and descriptions
  const roleOptions = [
    { value: 'student', label: 'Student', icon: <School className="w-4 h-4" />, description: 'Access courses and learning materials' },
    { value: 'faculty', label: 'Faculty', icon: <Book className="w-4 h-4" />, description: 'Create and manage courses' },
    { value: 'institute', label: 'Institute', icon: <Home className="w-4 h-4" />, description: 'Manage faculty and students' },
    { value: 'admin', label: 'Admin', icon: <Settings className="w-4 h-4" />, description: 'Full system access' },
  ];

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.name === 'instituteId' && e.target.value !== '' ?
        parseInt(e.target.value, 10) :
        e.target.value === '' && e.target.name === 'instituteId' ? null :
          e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setRegisterData({
      ...registerData,
      role: role,
    });
    setDropdownOpen(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', loginData);

      if (response.data.success) {

        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.data.id,
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role,
          phoneNumber: response.data.data.phoneNumber,
          city: response.data.data.city,
          state: response.data.data.state,
          instituteId: response.data.data.instituteId,
          grade: response.data.data.grade,
          streakNumber: response.data.data.streakNumber,
        }));

        console.log('Login successful, showing welcome animation');
        setShowWelcomeAnimation(true);
      
        setTimeout(() => {
          console.log('Hiding welcome animation and redirecting');
          setShowWelcomeAnimation(false);
          redirectBasedOnRole(response.data.data.role);
        }, 3000);

        // Set user role in parent component
        setCurrUserRole(response.data.data.role);
        
        // Call the onLogin callback from App.js
        onLogin();

        
        
        // After 3 seconds, navigate based on role
        setTimeout(() => {
          setShowWelcomeAnimation(false);
          navigate('/lms/dashboard')
        }, 3000);
      } 
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', registerData);

      if (response.data.success) {
        // After successful registration, switch to login panel
        setIsRightPanelActive(false);
        setLoginData({
          email: registerData.email,
          password: registerData.password,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/lms/dashboard');
        break;
      case 'institute':
        navigate('/institutedashboard');
        break;
      case 'faculty':
        navigate('/facultydashboard');
        break;
      case 'student':
      default:
        navigate('/lms/dashboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* If welcome animation is showing, render ONLY that */}
      {showWelcomeAnimation && <WelcomeAnimation />}
      
      {/* Only render the login/signup form if welcome animation is not showing */}
      {!showWelcomeAnimation && (
        <>
          {/* Error Alert */}
          {error && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-md z-50 flex items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Container */}
          <div
            className={`relative bg-white rounded-2xl shadow-xl w-full max-w-5xl min-h-[600px] md:min-h-[700px] overflow-hidden transition-all duration-700 ease-in-out
              ${isRightPanelActive ? 'right-panel-active' : ''}`}
            style={{
              '--tw-shadow': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
              'boxShadow': 'var(--tw-shadow)',
            }}
          >
            {/* Sign Up Container */}
            <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 
              ${isRightPanelActive ? 'translate-x-0 md:translate-x-full opacity-100 z-50' : 'translate-x-full md:translate-x-0 opacity-0 z-10'}`}>
              <form onSubmit={handleRegisterSubmit} className="bg-white h-full flex flex-col items-center justify-center px-6 md:px-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-gray-800">Create Account</h1>
                
                <div className="flex gap-4 my-3 md:my-5">
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Home className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <School className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Book className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                </div>
                
                <span className="text-xs md:text-sm text-gray-500">or use your email for registration</span>
                
                <div className="w-full mt-3 md:mt-4 space-y-3 md:space-y-4 max-w-md">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={registerData.phoneNumber}
                      onChange={handleRegisterChange}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={registerData.city}
                      onChange={handleRegisterChange}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={registerData.state}
                      onChange={handleRegisterChange}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      required
                    />
                    
                    {/* Conditional Grade field for students */}
                    {registerData.role === 'student' ? (
                      <input
                        type="text"
                        name="grade"
                        placeholder="Grade"
                        value={registerData.grade}
                        onChange={handleRegisterChange}
                        className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        required
                      />
                    ) : (
                      <input
                        type="number"
                        name="instituteId"
                        placeholder="Institute ID (optional)"
                        value={registerData.instituteId || ''}
                        onChange={handleRegisterChange}
                        className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Enhanced Role Dropdown */}
                  <div className="w-full relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="bg-gray-100 w-full p-2 md:p-3 rounded-lg flex items-center justify-between shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <div className="flex items-center">
                        {roleOptions.find(option => option.value === registerData.role)?.icon}
                        <span className="ml-2 text-sm md:text-base">
                          {roleOptions.find(option => option.value === registerData.role)?.label || 'Select Role'}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-lg z-50 border border-gray-200 max-h-40 overflow-y-auto">
                        {roleOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleRoleSelect(option.value)}
                            className={`p-2 md:p-3 hover:bg-gray-50 cursor-pointer flex items-start transition-colors ${registerData.role === option.value ? 'bg-gray-50' : ''}`}
                          >
                            <div className="mt-1">{option.icon}</div>
                            <div className="ml-2">
                              <div className="font-medium text-sm md:text-base">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 md:mt-6 bg-gradient-to-r from-primary-500 to-secondary-400 text-white rounded-full px-8 md:px-12 py-2 md:py-3 font-bold uppercase tracking-wide transform hover:scale-105 transition-transform disabled:opacity-70 shadow-md"
                >
                  {loading ? 'Processing...' : 'Sign Up'}
                </button>
                
                {/* Added "Already a user? Login" link */}
                <p className="mt-4 text-sm text-gray-600">
                  Already have an account? 
                  <button 
                    type="button"
                    onClick={() => setIsRightPanelActive(false)}
                    className="ml-1 text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>

            {/* Sign In Container */}
            <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-20
              ${isRightPanelActive ? 'opacity-0 md:translate-x-full' : 'opacity-100'}`}>
              <form onSubmit={handleLoginSubmit} className="bg-white h-full flex flex-col items-center justify-center px-6 md:px-12 text-center">
                <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-primary-600">Sign In</h1>
                
                <div className="flex gap-4 my-3 md:my-5">
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Home className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <School className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                  <a href="#" className="border border-gray-200 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Book className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </a>
                </div>
                
                <span className="text-xs md:text-sm text-gray-500">or use your account</span>
                
                <div className="w-full mt-3 md:mt-4 space-y-3 md:space-y-4 max-w-md">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="bg-gray-100 w-full p-2 md:p-3 rounded-lg border-none shadow-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
                  />
                </div>
                
                <a href="#" className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 hover:text-gray-800 transition-colors">Forgot your password?</a>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 md:mt-6 bg-gradient-to-r from-primary-500 to-secondary-400 text-white rounded-full px-8 md:px-12 py-2 md:py-3 font-bold uppercase tracking-wide transform hover:scale-105 transition-transform disabled:opacity-70 shadow-md"
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
                
                {/* Added "Don't have an account? Sign Up" link */}
                <p className="mt-4 text-sm text-gray-600">
                  Don't have an account?
                  <button 
                    type="button"
                    onClick={() => setIsRightPanelActive(true)}
                    className="ml-1 text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </div>

            {/* Overlay Container - Mobile Version */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-400 text-white text-center p-4 z-30">
              {isRightPanelActive ? (
                <div className="flex flex-col items-center">
                  <p className="text-white/90 mb-2">Already have an account?</p>
                  <button
                    onClick={() => setIsRightPanelActive(false)}
                    className="bg-blue border border-white text-white rounded-full px-6 py-2 font-medium uppercase tracking-wide transform hover:scale-105 transition-transform text-sm"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-white/90 mb-2">Don't have an account?</p>
                  <button
                    onClick={() => setIsRightPanelActive(true)}
                    className="bg-transparent border border-white text-white rounded-full px-6 py-2 font-medium uppercase tracking-wide transform hover:scale-105 transition-transform text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Overlay Container - Desktop Version */}
            <div className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 z-100
              ${isRightPanelActive ? '-translate-x-full' : ''}">
              <div className={`relative bg-gradient-to-r from-primary-500 to-secondary-400 text-white h-full w-[200%] -left-full
                transition-transform duration-700 ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                
                {/* Overlay Left */}
                <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 bg-blue-200
                  transition-transform duration-700 ${isRightPanelActive ? 'translate-x-0' : '-translate-x-20 opacity-0'}`}>
                  <h1 className="text-3xl font-bold mb-4 ">Welcome Back!</h1>
                  <p className="text-white/90 mb-6">To keep connected with us please login with your personal info</p>
                  <button
                    onClick={() => setIsRightPanelActive(false)}
                    className="bg-transparent border border-white text-white rounded-full px-12 py-3 font-bold uppercase tracking-wide transform hover:scale-105 transition-transform"
                  >
                    Sign In
                  </button>
                </div>

                {/* Overlay Right */}
                <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 right-0 h-full w-1/2
                  transition-transform duration-700 ${isRightPanelActive ? 'translate-x-20 opacity-0' : 'translate-x-0'}`}>
                  <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
                  <p className="text-white/90 mb-6">Enter your personal details and start journey with us</p>
                  <button
                    onClick={() => setIsRightPanelActive(true)}
                    className="bg-transparent border border-white text-white rounded-full px-12 py-3 font-bold uppercase tracking-wide transform hover:scale-105 transition-transform"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Styles */}
          <style>{`
            .right-panel-active .sign-up-container {
              transform: translateX(100%);
              opacity: 1;
              z-index: 5;
              animation: show 0.6s;
            }

            @keyframes show {
              0%, 49.99% {
                opacity: 0;
                z-index: 1;
              }
              
              50%, 100% {
                opacity: 1;
                z-index: 5;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default Login;