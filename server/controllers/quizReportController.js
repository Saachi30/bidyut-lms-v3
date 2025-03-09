const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket');

// Helper function to update user streak
const updateUserStreak = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the user has submitted a report yesterday
    const lastReport = await prisma.quizReport.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, streakNumber: true },
    });

    if (user) {
      let newStreakValue = user.streakNumber || 0;

      if (lastReport) {
        // If the user submitted a report yesterday, increment the streak
        newStreakValue += 1;
      } else {
        // If the user did not submit a report yesterday, reset the streak
        newStreakValue = 1;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { streakNumber: newStreakValue },
      });

      console.log(`Successfully updated streak to ${newStreakValue}`);
    } else {
      console.log(`User ${userId} not found`);
    }
  } catch (streakError) {
    console.error('Error updating streak:', streakError);
  }
};

// Simplified submit quiz report with direct streak update
const submitQuizReport = async (req, res, next) => {
  try {
    console.log('Submitting quiz report...');
    const { quizId, score, completed = false, answers = null } = req.body;
    const userId = req.user.id;

    console.log(`Quiz submission for user ${userId}, quiz ${quizId}`);

    // Check if a report already exists for this user and quiz
    const existingReport = await prisma.quizReport.findFirst({
      where: {
        userId: userId,
        quizId: parseInt(quizId),
      },
    });

    let quizReport;

    if (existingReport) {
      console.log(`Updating existing report ${existingReport.id}`);
      // Update the existing report
      quizReport = await prisma.quizReport.update({
        where: {
          id: existingReport.id,
        },
        data: {
          score,
          completed,
          answers: answers ? JSON.stringify(answers) : null,
        },
      });
    } else {
      console.log('Creating new quiz report');
      // Create a new report
      quizReport = await prisma.quizReport.create({
        data: {
          quizId: parseInt(quizId),
          userId: userId,
          score,
          completed,
          answers: answers ? JSON.stringify(answers) : null,
        },
      });

      console.log('New report created, checking if streak should be updated');
      await updateUserStreak(userId);
    }

    // Emit score update to the socket room
    const io = getIO();
    io.to(`quiz_${quizId}`).emit('scoreUpdate', {
      userId: userId,
      newScore: score,
      totalQuestions: answers ? Object.keys(answers).length : 0,
    });

    // Send response
    res.status(201).json({
      success: true,
      data: quizReport,
    });
  } catch (error) {
    console.error('Error in submitQuizReport:', error);
    next(error);
  }
};

// Apply the same streak logic to updateQuizReport
const updateQuizReport = async (req, res, next) => {
  try {
    console.log('Updating quiz report...');
    const { quizId, score, currentQuestionIndex, answers = null } = req.body;
    const userId = req.user.id;

    // Check if a report already exists for this user and quiz
    const existingReport = await prisma.quizReport.findFirst({
      where: {
        userId: userId,
        quizId: parseInt(quizId),
      },
    });

    let quizReport;

    if (existingReport) {
      console.log(`Updating existing report ${existingReport.id}`);
      // Update the existing report
      quizReport = await prisma.quizReport.update({
        where: {
          id: existingReport.id,
        },
        data: {
          score,
          answers: answers ? JSON.stringify(answers) : null,
          currentQuestionIndex,
        },
      });
    } else {
      console.log('Creating new quiz report during update');
      // Create a new report
      quizReport = await prisma.quizReport.create({
        data: {
          quizId: parseInt(quizId),
          userId: userId,
          score,
          answers: answers ? JSON.stringify(answers) : null,
          currentQuestionIndex,
        },
      });

      console.log('New report created during update, checking if streak should be updated');
      await updateUserStreak(userId);
    }

    // Emit score update to the socket room
    const io = getIO();
    io.to(`quiz_${quizId}`).emit('scoreUpdate', {
      userId: userId,
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
        quiz: true,
      },
      orderBy: {
        createdAt: 'desc',
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