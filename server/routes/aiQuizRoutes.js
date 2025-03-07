const express = require('express');
const {
  generateAIQuiz,
  submitAIQuizReport
} = require('../controllers/aiQuizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', generateAIQuiz);
router.post('/report', submitAIQuizReport);

module.exports = router;