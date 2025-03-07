const express = require('express');
const { 
  getFacultyStudents, 
  getFacultyStudentById, 
  createFacultyStudent, 
  deleteFacultyStudent,
  getStudentsByFaculty,
  getFacultiesByStudent
} = require('../controllers/facultyStudentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get all faculty-student relationships with permissions
router.get('/', getFacultyStudents);
router.get('/:id', getFacultyStudentById);

// Create and delete relationships (admin, institute, faculty)
router.post('/', authorize('admin', 'institute', 'faculty'), createFacultyStudent);
router.delete('/:id', authorize('admin', 'institute', 'faculty'), deleteFacultyStudent);

// Get students by faculty
router.get('/faculty/:facultyId/students', getStudentsByFaculty);

// Get faculties by student
router.get('/student/:studentId/faculties', getFacultiesByStudent);

module.exports = router;