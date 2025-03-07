const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getFaculties,
  updateUserStreak,
  findUserByEmail,
  findStudentByEmail
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Define routes
router.get('/', authorize('admin', 'institute', 'faculty'), getUsers);
router.get('/students/all', authorize('admin', 'institute', 'faculty'), getStudents);
router.get('/faculties/all', authorize('admin', 'institute'), getFaculties);
router.get('/:id', getUserById);
router.get('/email/:email', authorize('admin', 'institute', 'faculty'), findUserByEmail);
router.get('/student/email/:email', authorize('admin', 'institute', 'faculty', 'student'), findStudentByEmail);
router.post('/', authorize('admin', 'institute'), createUser);
router.put('/:id', authorize('admin', 'institute', 'faculty'), updateUser);
router.delete('/:id', authorize('admin', 'institute'), deleteUser);
router.patch('/:id/streak', authorize('admin', 'institute', 'faculty'), updateUserStreak);

module.exports = router;