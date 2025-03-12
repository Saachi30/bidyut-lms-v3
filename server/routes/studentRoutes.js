const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.get('/', authorize('admin', 'institute', 'faculty'), getStudents);
router.get('/:id', authorize('admin', 'institute', 'faculty'), getStudentById);
router.post('/', authorize('admin', 'institute'), createStudent);
router.put('/:id', authorize('admin', 'institute'), updateStudent);
router.delete('/:id', authorize('admin', 'institute'), deleteStudent);

module.exports = router;