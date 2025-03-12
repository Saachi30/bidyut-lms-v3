const express = require('express');
const {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes
router.get('/', authorize('admin', 'institute'), getFaculties);
router.get('/:id', authorize('admin', 'institute'), getFacultyById);
router.post('/', authorize('admin', 'institute'), createFaculty);
router.put('/:id', authorize('admin', 'institute'), updateFaculty);
router.delete('/:id', authorize('admin', 'institute'), deleteFaculty);

module.exports = router;