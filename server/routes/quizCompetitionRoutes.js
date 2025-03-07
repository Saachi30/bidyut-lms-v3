const express = require('express');
const { markUserAsReady, getQuizParticipants } = require('../controllers/quizCompetitionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.post('/:quizId/ready', markUserAsReady);
router.get('/:id/participants', getQuizParticipants); // Add this line

module.exports = router;