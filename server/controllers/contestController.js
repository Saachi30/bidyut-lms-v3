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
        participants: {
          include: {
            user: true
          }
        }
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
 * @desc    Get a single contest with user attempt status
 * @route   GET /api/contests/:id
 * @access  Private
 */
const getContest = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);
    const userId = req.user.id;

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        quiz: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (!contest) {
      const error = new Error('Contest not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if user has attempted the quiz
    let userAttempt = null;
    if (userId) {
      const quizReport = await prisma.quizReport.findFirst({
        where: {
          quizId: contest.quiz.id,
          userId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      userAttempt = {
        hasAttempted: Boolean(quizReport),
        score: quizReport?.score || null,
        isSubmitted: quizReport?.isSubmitted || false
      };
    }

    res.status(200).json({
      success: true,
      data: {
        ...contest,
        userAttempt
      }
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
      where: { id: contestId },
      include: {
        quiz: true
      }
    });

    if (!contest) {
      const error = new Error('Contest not found');
      error.statusCode = 404;
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

    // Check if user has already attempted the quiz
    const quizReport = await prisma.quizReport.findFirst({
      where: {
        quizId: contest.quiz.id,
        userId
      }
    });

    if (quizReport) {
      const error = new Error('You have already attempted this contest');
      error.statusCode = 400;
      return next(error);
    }

    // Allow registration for upcoming contests
    const now = new Date();
    if (now > contest.endTime) {
      const error = new Error('Contest has already ended');
      error.statusCode = 400;
      return next(error);
    }

    // Register user for the contest with score = 0
    const participant = await prisma.contestParticipant.create({
      data: {
        contestId,
        userId,
        score: 0 // Remove hasAttempted from here
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
    const { score, quizReportId } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      const error = new Error('Only students can submit contest scores');
      error.statusCode = 403;
      return next(error);
    }

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: {
        quiz: true
      }
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

    // Ensure user hasn't already submitted a score
    if (participant.hasAttempted) {
      const error = new Error('You have already submitted a score for this contest');
      error.statusCode = 400;
      return next(error);
    }

    // Verify the quiz report if quizReportId is provided
    if (quizReportId) {
      const quizReport = await prisma.quizReport.findUnique({
        where: { 
          id: parseInt(quizReportId)
        }
      });

      if (!quizReport || quizReport.userId !== userId || quizReport.quizId !== contest.quiz.id) {
        const error = new Error('Invalid quiz report');
        error.statusCode = 400;
        return next(error);
      }

      // Update the quiz report to mark it as submitted for the contest
      await prisma.quizReport.update({
        where: { id: parseInt(quizReportId) },
        data: { isSubmitted: true }
      });
    }

    // Update participant's score and mark as attempted
    const updatedParticipant = await prisma.contestParticipant.update({
      where: { id: participant.id },
      data: { 
        score: parseInt(score),
        hasAttempted: true,
        submittedAt: new Date()
      },
      include: {
        user: true,
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

/**
 * @desc    Get contest leaderboard
 * @route   GET /api/contests/:id/leaderboard
 * @access  Private
 */
const getContestLeaderboard = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);

    // Check if contest exists
    const contest = await prisma.contest.findUnique({
      where: { id: contestId }
    });

    if (!contest) {
      const error = new Error('Contest not found');
      error.statusCode = 404;
      return next(error);
    }

    // Get all participants with user info
    const participants = await prisma.contestParticipant.findMany({
      where: {
        contestId,
        hasAttempted: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            profilePicture: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { submittedAt: 'asc' }
      ]
    });

    // Calculate participant ranks
    const leaderboard = participants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a contest
 * @route   PUT /api/contests/:id
 * @access  Private/Admin, Institute, Faculty
 */
const updateContest = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);
    const { startTime, endTime } = req.body;
    const updaterRole = req.user.role;

    // Check if updater has permission
    if (!['admin', 'institute', 'faculty'].includes(updaterRole)) {
      const error = new Error('Unauthorized to update contests');
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

    // Update contest
    const updatedContest = await prisma.contest.update({
      where: { id: contestId },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      },
      include: {
        quiz: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedContest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a contest
 * @route   DELETE /api/contests/:id
 * @access  Private/Admin
 */
const deleteContest = async (req, res, next) => {
  try {
    const contestId = parseInt(req.params.id);

    // Check if user is admin
    if (req.user.role !== 'admin') {
      const error = new Error('Only admins can delete contests');
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

    // Delete all participants first to avoid foreign key constraint errors
    await prisma.contestParticipant.deleteMany({
      where: { contestId }
    });

    // Delete the contest
    await prisma.contest.delete({
      where: { id: contestId }
    });

    res.status(200).json({
      success: true,
      message: 'Contest deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createContest,
  getContests,
  getContest,
  participateInContest,
  submitContestScore,
  getContestLeaderboard,
  updateContest,
  deleteContest
};