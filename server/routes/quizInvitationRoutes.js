const express = require('express');
const {
  sendQuizInvitation,
  acceptQuizInvitation,
  declineQuizInvitation,
  getQuizInvitations
} = require('../controllers/quizInvitationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getQuizInvitations);
router.post('/', sendQuizInvitation);
router.put('/:id/accept', acceptQuizInvitation);
router.put('/:id/decline', declineQuizInvitation);

module.exports = router;