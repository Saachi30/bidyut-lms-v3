const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Generate an AI quiz
 * @route   POST /api/ai-quizzes
 * @access  Private
 */
const generateAIQuiz = async (req, res, next) => {
  try {
    // Simulate AI-generated quiz (not stored in DB)
    const aiQuiz = {
      title: 'AI-Generated Quiz',
      questions: [
        { question: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' },
        { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin'], answer: 'Paris' }
      ]
    };

    res.status(200).json({
      success: true,
      data: aiQuiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit AI quiz report
 * @route   POST /api/ai-quizzes/report
 * @access  Private
 */
const submitAIQuizReport = async (req, res, next) => {
  try {
    const { score } = req.body;

    // Store AI quiz report
    const aiQuizReport = await prisma.aIQuizReport.create({
      data: {
        userId: req.user.id,
        score
      }
    });

    res.status(201).json({
      success: true,
      data: aiQuizReport
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAIQuiz,
  submitAIQuizReport
};