const express = require('express');
const {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  deleteEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Admin, institute, and faculty can view all enrollments
router.get('/', authorize('admin', 'institute', 'faculty'), getEnrollments);

// Get a specific enrollment by ID
router.get('/:id', getEnrollmentById);

// Admin, institute, and faculty can enroll students
router.post('/', authorize('admin', 'institute', 'faculty'), createEnrollment);

// Admin, institute, and faculty can delete enrollments
router.delete('/:id', authorize('admin', 'institute', 'faculty'), deleteEnrollment);

module.exports = router;