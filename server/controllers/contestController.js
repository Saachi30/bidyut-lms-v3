const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Create a new contest
 * @route   POST /api/contests
 * @access  Private/Admin, Institute, Faculty
 */
const createContest = async (req, res, next) => {
  try {
    const { quizId, startTime, endTime } = req.body;
    const creatorRole = req.user.role;

    // Check if creator has permission to create contest
    if (!['admin', 'institute', 'faculty'].includes(creatorRole)) {
      const error = new Error('Unauthorized to create contests');
      error.statusCode = 403;
      return next(error);
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) }
    });

    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if contest already exists for this quiz
    const existingContest = await prisma.contest.findUnique({
      where: { quizId: parseInt(quizId) }
    });

    if (existingContest) {
      const error = new Error('Contest already exists for this quiz');
      error.statusCode = 400;
      return next(error);
    }

    // Create contest
    const contest = await prisma.contest.create({
      data: {
        quizId: parseInt(quizId),
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      },
      include: {
        quiz: true
      }
    });

    res.status(201).json({
      success: true,
      data: contest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contests
 * @route   GET /api/contests
 * @access  Private
 */
const getContests = async (req, res, next) => {
  try {
    const contests = await prisma.contest.findMany({
      include: {
        quiz: true,
        participants: true
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: contests.length,
      data: contests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Participate in a contest (register the user with score 0)
 * @route   POST /api/contests/:id/participate
 * @access  Private/Student
 */
const participateInContest = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);
    const userId = req.user.id;

    // Check if user is a student
    if (req.user.role !== 'student') {
      const error = new Error('Only students can participate in contests');
      error.statusCode = 403;
      return next(error);
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      const error = new Error('Contest not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check contest time validity
    const now = new Date();
    if (now < contest.startTime || now > contest.endTime) {
      const error = new Error('Contest is not currently active');
      error.statusCode = 400;
      return next(error);
    }

    // Check if user is already registered
    const existingParticipant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId
      }
    });

    if (existingParticipant) {
      const error = new Error('Already registered for this contest');
      error.statusCode = 400;
      return next(error);
    }

    // Register user for the contest with score = 0
    const participant = await prisma.contestParticipant.create({
      data: {
        contestId,
        userId,
        score: 0
      },
      include: {
        contest: {
          include: {
            quiz: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the contest.',
      data: participant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit score for a contest
 * @route   POST /api/contests/:id/submit-score
 * @access  Private/Student
 */
const submitContestScore = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);
    const userId = req.user.id;
    const { score } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      const error = new Error('Only students can submit contest scores');
      error.statusCode = 403;
      return next(error);
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      const error = new Error('Contest not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check contest time validity for score submission
    const now = new Date();
    if (now < contest.startTime || now > contest.endTime) {
      const error = new Error('Contest is not currently active');
      error.statusCode = 400;
      return next(error);
    }

    // Ensure user is a registered participant
    const participant = await prisma.contestParticipant.findFirst({
      where: {
        contestId,
        userId
      }
    });

    if (!participant) {
      const error = new Error('You must participate in the contest first');
      error.statusCode = 403;
      return next(error);
    }

    // Update participant's score
    const updatedParticipant = await prisma.contestParticipant.update({
      where: { id: participant.id },
      data: { score },
      include: {
        contest: {
          include: {
            quiz: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Score submitted successfully',
      data: updatedParticipant
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContest,
  getContests,
  participateInContest,
  submitContestScore
};