const express = require('express');
const { globalSearch, advancedSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware'); // Only protect if needed

const router = express.Router();

// Global search route (accessible to all)
router.get('/global', globalSearch);

// Advanced search route (accessible to all)
router.post('/advanced', advancedSearch);

module.exports = router;