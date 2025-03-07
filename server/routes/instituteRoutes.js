const express = require('express');
const {
  getInstitutes,
  getInstituteById,
  createInstitute,
  updateInstitute,
  deleteInstitute,
  getInstituteUsers,
} = require('../controllers/instituteController'); // Adjust the path as necessary
const { protect, authorize } = require('../middleware/authMiddleware'); // Adjust the path as necessary

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// All users can view institutes, but with different permissions
router.get('/', getInstitutes);
router.get('/:id', getInstituteById);

// Admin-only routes
router.post('/', authorize('admin'), createInstitute);
router.put('/:id', authorize('admin'), updateInstitute);
router.delete('/:id', authorize('admin'), deleteInstitute);

// Get users by institute (admin or institute-specific users)
router.get('/:id/users', authorize('admin', 'institute'), getInstituteUsers);

module.exports = router;