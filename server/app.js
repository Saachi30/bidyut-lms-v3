const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const http = require('http');
const { errorHandler } = require('./middleware/errorMiddleware');
const { routeNotFound } = require('./middleware/routeNotFoundMiddleware');

// For logging HTTP requests (helpful for debugging)
// Import routes
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const subtopicRoutes = require('./routes/subtopicRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const facultyStudentRoutes = require('./routes/facultyStudentRoutes');
const searchRoutes = require('./routes/searchRoutes');
const facultyGradeRoutes=require('./routes/facultyGradeRoutes');

// Import new routes
const quizRoutes = require('./routes/quizRoutes');
const quizInvitationRoutes = require('./routes/quizInvitationRoutes');
const contestRoutes = require('./routes/contestRoutes');
const aiQuizRoutes = require('./routes/aiQuizRoutes');
const quizCompetitionRoutes = require('./routes/quizCompetitionRoutes');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the server
const { initializeSocket } = require('./socket');
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users/faculties', facultyGradeRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subtopics', subtopicRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/faculty-students', facultyStudentRoutes);

// New routes for quizzes, contests, and AI-generated quizzes
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-invitations', quizInvitationRoutes);
app.use('/api/quiz-competition', quizCompetitionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/ai-quizzes', aiQuizRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/search', searchRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the LMS API' });
});

// Error handling
app.use(routeNotFound);
app.use(errorHandler);

module.exports = { app, server };