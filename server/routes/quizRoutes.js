const express = require('express');
const {
  createQuiz,
  getQuizById,
  getParticipantsForQuiz,
  addParticipantToQuiz,
  getQuizByCode,
} = require('../controllers/quizController');

const {
  submitQuizReport,
  updateQuizReport,
  getLatestQuizReport,
  getAllQuizReportsForUser, // Import the new controller function
} = require('../controllers/quizReportController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Quiz routes
router.get('/:id', getQuizById); // Get a specific quiz by ID
router.get('/:id/participants', getParticipantsForQuiz); // Get participants for a specific quiz
router.get('/code/:code', getQuizByCode); // Get a quiz by its code

// Quiz report routes
router.post('/reports', submitQuizReport); // Submit a quiz report
router.put('/reports/:id', updateQuizReport); // Update a quiz report
router.get('/reports/:quizId/latest', getLatestQuizReport); // Get the latest quiz report for a user and quiz
router.get('/reports/user/all', getAllQuizReportsForUser); // New route: Get all quiz reports for the authenticated user

// Admin and faculty routes for quiz management
router.post('/', authorize('admin', 'faculty'), createQuiz); // Create a new quiz (admin/faculty only)
router.post('/participants', authorize('admin', 'faculty'), addParticipantToQuiz); // Add a participant to a quiz (admin/faculty only)

module.exports = router;