const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket');

const submitQuizReport = async (req, res, next) => {
  try {
    const { quizId, score, completed = false, answers = null } = req.body;

    // Check if a report already exists for this user and quiz
    const existingReport = await prisma.quizReport.findFirst({
      where: {
        userId: req.user.id,
        quizId: parseInt(quizId),
      },
    });

    let quizReport;

    if (existingReport) {
      // Update the existing report
      quizReport = await prisma.quizReport.update({
        where: {
          id: existingReport.id, // Use the report's ID to update
        },
        data: {
          score,
          completed,
          answers: answers ? JSON.stringify(answers) : null,
        },
      });
    } else {
      // Create a new report
      quizReport = await prisma.quizReport.create({
        data: {
          quizId: parseInt(quizId),
          userId: req.user.id,
          score,
          completed,
          answers: answers ? JSON.stringify(answers) : null,
        },
      });
    }

    // Emit score update to the socket room
    const io = getIO();
    io.to(`quiz_${quizId}`).emit('scoreUpdate', {
      userId: req.user.id,
      newScore: score,
      totalQuestions: answers ? Object.keys(answers).length : 0,
    });

    // Send response
    res.status(201).json({
      success: true,
      data: quizReport,
    });
  } catch (error) {
    next(error);
  }
};
const updateQuizReport = async (req, res, next) => {
  try {
    const { quizId, score, currentQuestionIndex, answers = null } = req.body;

    // Check if a report already exists for this user and quiz
    const existingReport = await prisma.quizReport.findFirst({
      where: {
        userId: req.user.id,
        quizId: parseInt(quizId),
      },
    });

    let quizReport;

    if (existingReport) {
      // Update the existing report
      quizReport = await prisma.quizReport.update({
        where: {
          id: existingReport.id, // Use the report's ID to update
        },
        data: {
          score,
          answers: answers ? JSON.stringify(answers) : null,
          currentQuestionIndex,
        },
      });
    } else {
      // Create a new report
      quizReport = await prisma.quizReport.create({
        data: {
          quizId: parseInt(quizId),
          userId: req.user.id,
          score,
          answers: answers ? JSON.stringify(answers) : null,
          currentQuestionIndex,
        },
      });
    }

    // Emit score update to the socket room
    const io = getIO();
    io.to(`quiz_${quizId}`).emit('scoreUpdate', {
      userId: req.user.id,
      newScore: score,
      totalQuestions: answers ? Object.keys(answers).length : 0,
    });

    // Send response
    res.status(200).json({
      success: true,
      data: quizReport,
    });
  } catch (error) {
    console.error('Error in updateQuizReport:', error);
    next(error);
  }
};
const getAllQuizReportsForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const quizReports = await prisma.quizReport.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        quiz: true, // Include quiz details if needed
      },
      orderBy: {
        createdAt: 'desc', // Order by latest first
      },
    });

    res.status(200).json({
      success: true,
      data: quizReports,
    });
  } catch (error) {
    next(error);
  }
};

const getLatestQuizReport = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.quizId);

    const quizReport = await prisma.quizReport.findFirst({
      where: {
        quizId,
        userId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: quizReport
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuizReport,
  updateQuizReport,
  getLatestQuizReport,
  getAllQuizReportsForUser
};