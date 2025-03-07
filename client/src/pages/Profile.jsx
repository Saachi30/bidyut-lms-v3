import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';
import {
  BookOpen, Award, GraduationCap, X, RotateCw, 
  User, Mail, Phone, MapPin, Bell, Flame
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import NotificationCenter component
import NotificationCenter from '../components/Notification';

// Import robot models - Keep hardcoded as requested
import robot1 from '../assets/robo1.glb';
import robot2 from '../assets/robo1.glb';
import robot3 from '../assets/robo1.glb';
import robot4 from '../assets/robo1.glb';
import robot5 from '../assets/robo1.glb';

// 3D Model Components with error handling
function RobotModel({ url }) {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene} position={[0, -1, 0]} scale={1.5} />;
  } catch (error) {
    console.error("Error loading 3D model:", error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="purple" />
      </mesh>
    );
  }
}

// 2D Preview Component with error handling
function RobotPreview({ url }) {
  return (
    <div className="w-full aspect-square bg-gradient-to-br from-primary-100 to-secondary-100">
      <ErrorBoundary fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-primary-500">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
            </svg>
          </div>
        </div>
      }>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <Suspense fallback={null}>
            <RobotModel url={url} />
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

// Simple Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Profile = () => {
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    studentId: '',
    phone: '',
    location: '',
    city: '',
    state: '',
    grade: '',
    streakNumber: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quizReports, setQuizReports] = useState([]);
  const navigate=useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get basic user data from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};

        // Fetch additional user details from the backend
        const userResponse = await axios.get('/api/auth/me');
        if (userResponse.data.success) {
          const additionalData = userResponse.data.data || {};
          setUserData({
            id: storedUser.id || additionalData.id || '',
            name: storedUser.name || additionalData.name || '',
            email: storedUser.email || additionalData.email || '',
            role: storedUser.role || additionalData.role || 'student',
            studentId: additionalData.studentId || storedUser.id || 'STU' + Math.floor(100000 + Math.random() * 900000),
            phone: additionalData.phoneNumber || '+1 234 567 8900',
            location: (additionalData.city && additionalData.state)
              ? `${additionalData.city}, ${additionalData.state}`
              : 'New York, USA',
            city: additionalData.city || 'New York',
            state: additionalData.state || 'USA',
            grade: additionalData.grade || 'Grade 10',
            streakNumber: additionalData.streakNumber || 0
          });
        }

        // Fetch quiz reports
        const reportsResponse = await axios.get('/api/quizzes/reports/user/all');
        setQuizReports(reportsResponse.data.data);

        // Fetch recent activity and notifications
        await fetchRecentActivity();
        await fetchNotifications();
      } catch (err) {
        console.error('Error fetching user data or quiz reports:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle click on quiz report to navigate to the report page
  const handleQuizReportClick = (reportId) => {
    navigate(`/quiz-report/${reportId}`); // Navigate to the quiz report page
  };
  
  const fetchRecentActivity = async () => {
    try {
      setRecentActivity([
        { id: 1, type: 'quiz', title: 'Completed Basic Robotics Quiz', score: '95%', time: new Date().toLocaleString() },
        { id: 2, type: 'course', title: 'Started Advanced Programming Course', progress: '15%', time: new Date(Date.now() - 86400000).toLocaleString() },
        { id: 3, type: 'achievement', title: 'Earned "Fast Learner" Badge', time: new Date(Date.now() - 172800000).toLocaleString() },
        { id: 4, type: 'quiz', title: 'Completed Circuit Design Quiz', score: '88%', time: new Date(Date.now() - 259200000).toLocaleString() }
      ]);
    } catch (err) {
      console.error('Error fetching activity data:', err);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      setNotifications([
        { id: 1, title: 'New Quiz Available: Robot Sensors', time: new Date().toLocaleString() },
        { id: 2, title: 'Course Update: Programming Fundamentals', time: new Date(Date.now() - 43200000).toLocaleString() },
        { id: 3, title: 'Achievement Unlocked: Quick Starter', time: new Date(Date.now() - 86400000).toLocaleString() }
      ]);
    } catch (err) {
      console.error('Error fetching notifications data:', err);
    }
  };
  
  const handleNotificationAction = (data) => {
    if (data.type === 'accept') {
      const acceptedNotification = data.notifications.find(n => n.id === data.notificationId);
      if (acceptedNotification) {
        setRecentActivity(prev => [
          {
            id: Date.now(),
            type: 'quiz_invitation',
            title: `Accepted Quiz Invitation: ${acceptedNotification.message.split(':')[1].trim()}`,
            time: new Date().toLocaleString()
          },
          ...prev.slice(0, 3)
        ]);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const robotCollection = [
    {
      id: 1,
      name: 'Quiz Master Bot',
      description: 'Earned after completing 10 quizzes',
      modelUrl: robot1,
    },
    {
      id: 2,
      name: 'Course Champion Bot',
      description: 'Earned after completing 5 courses',
      modelUrl: robot2,
    },
    {
      id: 3,
      name: 'Perfect Score Bot',
      description: 'Earned for 100% quiz score',
      modelUrl: robot3,
    },
    {
      id: 4,
      name: 'Speed Learner Bot',
      description: 'Completed course in record time',
      modelUrl: robot4,
    },
    {
      id: 5,
      name: 'Achievement Hunter Bot',
      description: 'Unlocked 20 achievements',
      modelUrl: robot5,
    }
  ];

  const studentStats = [
    { label: 'Quizzes Completed', value: '45', icon: BookOpen },
    { label: 'Average Score', value: '92%', icon: Award },
    { label: 'Courses Completed', value: '8', icon: GraduationCap },
    { label: 'Robots Earned', value: '3', icon: Award }
  ];

  const progressData = [
    { month: 'Jan', roboticsConcepts: 65, practicalSkills: 40, projectCompletion: 30 },
    { month: 'Feb', roboticsConcepts: 68, practicalSkills: 45, projectCompletion: 35 },
    { month: 'Mar', roboticsConcepts: 75, practicalSkills: 55, projectCompletion: 45 },
    { month: 'Apr', roboticsConcepts: 85, practicalSkills: 65, projectCompletion: 60 },
    { month: 'May', roboticsConcepts: 88, practicalSkills: 75, projectCompletion: 70 },
    { month: 'Jun', roboticsConcepts: 92, practicalSkills: 85, projectCompletion: 85 }
  ];

  const skillsData = [
    { subject: 'Robot Programming', A: 85 },
    { subject: 'Hardware Assembly', A: 78 },
    { subject: 'Problem Solving', A: 92 },
    { subject: 'Circuit Design', A: 82 },
    { subject: 'Sensor Integration', A: 88 },
    { subject: 'Project Management', A: 75 }
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
          <span className="text-4xl font-bold text-white">{getInitials(userData.name)}</span>
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-800">{userData.name || 'User'}</h1>
          <p className="text-lg text-gray-600">Student ID: {userData.studentId}</p>
        </div>
        
        {/* Streak display moved to the left of notification center */}
        <div className="flex items-center gap-2 mr-4">
          <Flame className="text-orange-500" size={20} />
          <span className="text-lg font-semibold text-orange-500">{userData.streakNumber} Day Streak</span>
        </div>
        
        <NotificationCenter onNotificationAction={handleNotificationAction} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {studentStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="text-primary-500" size={20} />
              <h3 className="text-gray-500">{stat.label}</h3>
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roboticsConcepts" stroke="#8884d8" name="Robotics Concepts" />
                <Line type="monotone" dataKey="practicalSkills" stroke="#82ca9d" name="Practical Skills" />
                <Line type="monotone" dataKey="projectCompletion" stroke="#ffc658" name="Project Completion" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Personal Details and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <User size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{userData.name || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{userData.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{userData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <MapPin size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">
                  {userData.city && userData.state 
                    ? `${userData.city}, ${userData.state}` 
                    : userData.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <GraduationCap size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Grade</p>
                <p className="font-medium">{userData.grade}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.slice(0, 4).map((notification, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Bell className="text-primary-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))
            ) : (
              recentActivity.slice(0, 4).map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="text-primary-500" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">{activity.title}</h4>
                    <p className="text-sm text-gray-500">
                      {activity.score ? `Score: ${activity.score}` : 
                       activity.progress ? `Progress: ${activity.progress}` : 
                       activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Quiz Reports Section */}
      {/* Quiz Reports Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-6">Quiz Reports</h2>
        {quizReports.length > 0 ? (
          <div className="space-y-4">
            {quizReports.map((report) => (
              <div
                key={report.id}
                onClick={() => handleQuizReportClick(report.id)} // Make the report clickable
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                <div>
                  <h3 className="font-medium">{report.quiz.title}</h3>
                  <p className="text-sm text-gray-500">Score: {report.score}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">No quiz reports found.</div>
        )}
      </div>
   

      {/* Robot Collection */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-6">Robot Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {robotCollection.map((robot) => (
            <div
              key={robot.id}
              onClick={() => {
                setSelectedRobot(robot);
                setIsModalOpen(true);
              }}
              className="cursor-pointer group"
            >
              <div className="bg-white rounded-xl p-4 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-gray-100">
                <div className="w-full aspect-square rounded-lg mb-3 overflow-hidden">
                  <RobotPreview url={robot.modelUrl} />
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-primary-500">
                  {robot.name}
                </h3>
                <p className="text-sm text-gray-500">{robot.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Model Modal */}
      {isModalOpen && selectedRobot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl m-4 relative overflow-hidden">
            <div className="h-96">
              <ErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-primary-500 text-center p-8">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold mb-2">{selectedRobot.name}</h3>
                    <p>Unable to load 3D model</p>
                  </div>
                </div>
              }>
                <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                  <Suspense fallback={null}>
                    <RobotModel url={selectedRobot.modelUrl} />
                  </Suspense>
                  <OrbitControls 
                    autoRotate={autoRotate}
                    autoRotateSpeed={2}
                    enableZoom={true}
                  />
                </Canvas>
              </ErrorBoundary>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <RotateCw size={20} className={autoRotate ? 'text-primary-500' : 'text-gray-500'} />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 border-t">
              <h3 className="text-xl font-semibold mb-2">{selectedRobot.name}</h3>
              <p className="text-gray-600">{selectedRobot.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;