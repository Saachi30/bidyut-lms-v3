const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstitutesCourses,
  getGradeCourses,
  getEnrolledStudents,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Custom routes must be defined BEFORE parameterized routes to avoid conflicts
// Get courses by institute
router.get('/institute/:instituteId', getInstitutesCourses);

// Get courses by grade
router.get('/grade/:grade', getGradeCourses);

// Get enrolled students for a grade
router.get('/grade/:grade/students', authorize('admin', 'institute', 'faculty'), getEnrolledStudents);

// Standard CRUD operations
// All authenticated users can view courses, but with different permissions
router.get('/', getCourses);

// Admin, institute, and faculty can create courses
router.post('/', authorize('admin', 'institute', 'faculty'), createCourse);

// Routes with :id parameter must come last
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;