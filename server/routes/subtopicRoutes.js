const express = require('express');
const { 
  getSubtopics, 
  getSubtopicById, 
  createSubtopic, 
  updateSubtopic, 
  deleteSubtopic,
  getCourseSubtopics
} = require('../controllers/subtopicController'); // Adjust the path as necessary
const { protect, authorize } = require('../middleware/authMiddleware'); // Adjust the path as necessary

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// All authenticated users can view subtopics
router.get('/', getSubtopics);
router.get('/:id', getSubtopicById);

// Admin, institute, and faculty can create subtopics
router.post('/', authorize('admin', 'institute', 'faculty'), createSubtopic);

// Only creator, admin, or associated institute can update/delete
router.put('/:id', updateSubtopic);
router.delete('/:id', deleteSubtopic);

// Get subtopics by course
router.get('/course/:courseId', getCourseSubtopics);

module.exports = router;