const express = require('express');
const {
  getFacultyEnrollments,
  getFacultyEnrollmentById,
  createFacultyEnrollment,
  deleteFacultyEnrollment,
  getFacultiesByGrade,
  getGradesByFaculty,
} = require('../controllers/facultyGradeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Get all faculty grade enrollments (accessible by all authenticated users)
router.get('/', getFacultyEnrollments);

// Get faculty enrollment by ID
router.get('/:id', getFacultyEnrollmentById);

// Admin and institute can create faculty grade enrollments
router.post('/', authorize('admin', 'institute'), createFacultyEnrollment);

// Admin and institute can delete faculty grade enrollments
router.delete('/:id', authorize('admin', 'institute'), deleteFacultyEnrollment);

// Get faculties by grade
router.get('/grade/:grade', getFacultiesByGrade);

// Get grades by faculty
router.get('/faculty/:facultyId/grades', getGradesByFaculty);

module.exports = router;