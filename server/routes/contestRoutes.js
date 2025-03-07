const express = require('express');
const {   
  createContest,
  getContests,
  participateInContest,
  submitContestScore 
} = require('../controllers/contestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Routes for contest management
router.post('/', 
  authorize('admin', 'institute', 'faculty'), 
  createContest
);

router.get('/', getContests);

router.post('/:id/participate', 
  authorize('student'), 
  participateInContest
);

router.post('/:id/submit-score', 
  authorize('student'), 
  submitContestScore
);

module.exports = router;