const express = require('express');
const { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// All users can view categories
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin and institute can create, update, delete categories
router.post('/', authorize('admin', 'institute'), createCategory);
router.put('/:id', authorize('admin', 'institute'), updateCategory);
router.delete('/:id', authorize('admin', 'institute'), deleteCategory);

module.exports = router;