const express = require('express');
const {
  createContest,
  getContests,
  getContest,
  participateInContest,
  submitContestScore,
  getContestLeaderboard,
  updateContest,
  deleteContest
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

router.get('/:id', getContest);

router.post('/:id/participate',
  authorize('student'),
  participateInContest
);

router.post('/:id/submit-score',
  authorize('student'),
  submitContestScore
);

router.get('/:id/leaderboard', getContestLeaderboard);

router.put('/:id',
  authorize('admin', 'institute', 'faculty'),
  updateContest
);

router.delete('/:id',
  authorize('admin'),
  deleteContest
);

module.exports = router;