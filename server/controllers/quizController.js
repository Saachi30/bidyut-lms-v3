const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

const createQuiz = async (req, res, next) => {
  try {
    const { title, description, questions, subtopicId } = req.body;
    const userId = req.user.id;

    // Check if quiz with the same title exists
    const quizExists = await prisma.quiz.findFirst({
      where: { title }
    });

    if (quizExists) {
      const error = new Error('Quiz with this title already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        questions: JSON.stringify(questions),
        subtopic: subtopicId ? { 
          connect: { id: subtopicId } 
        } : undefined,
        // Replace createdBy with a direct user relationship
        createdAt: new Date(), // Explicitly set createdAt if needed
        updatedAt: new Date()  // Explicitly set updatedAt if needed
      }
    });

    // Generate a unique quiz code
    let quizCode;
    let isUnique = false;
    while (!isUnique) {
      quizCode = uuidv4().substring(0, 8).toUpperCase();
      const existingCode = await prisma.quizCode.findUnique({
        where: { code: quizCode }
      });
      
      if (!existingCode) {
        isUnique = true;
      }
    }

    // Store the unique quiz code in the database
    const createdQuizCode = await prisma.quizCode.create({
      data: {
        code: quizCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        quiz: { connect: { id: quiz.id } },
        createdBy: { connect: { id: userId } },
      }
    });

    // Fetch full quiz details with quiz code
    const fullQuizDetails = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        subtopic: true,
        quizCodes: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        quiz: fullQuizDetails,
        quizCode: createdQuizCode.code
      }
    });
  } catch (error) {
    next(error);
  }
};


const getQuizById = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subtopic: true,
        quizCodes: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      return next(error);
    }

    // Transform participants data
    const participants = quiz.participants.map(p => ({
      userId: p.user.id,
      userName: p.user.name,
      role: p.user.role
    }));

    res.status(200).json({
      success: true,
      data: {
        ...quiz,
        participants,
        quizCode: quiz.quizCodes[0]?.code || null
      }
    });
  } catch (error) {
    next(error);
  }
};

const getParticipantsForQuiz = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id);

    // First, verify the quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Transform participants data
    const participants = quiz.participants
      .filter(p => p.user.role === 'student')  // Only return student participants
      .map(p => ({
        userId: p.user.id,
        userName: p.user.name,
        role: p.user.role
      }));

    res.status(200).json({
      success: true,
      data: participants
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    next(error);
  }
};

const addParticipantToQuiz = async (req, res, next) => {
  try {
    const { quizId, userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only allow students to be participants
    if (user.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Only students can be quiz participants'
      });
    }

    // Check if participant already exists
    const existingParticipant = await prisma.quizParticipant.findFirst({
      where: {
        quizId: parseInt(quizId),
        userId: parseInt(userId)
      }
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    // Add participant to quiz
    const participant = await prisma.quizParticipant.create({
      data: {
        quizId: parseInt(quizId),
        userId: parseInt(userId)
      }
    });

    res.status(201).json({
      success: true,
      data: participant
    });
  } catch (error) {
    next(error);
  }
};
const getQuizByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;

    // Find the quiz code
    const quizCode = await prisma.quizCode.findUnique({
      where: { code },
      include: { 
        quiz: {
          include: {
            subtopic: true
          }
        }
      }
    });

    // Check if quiz code exists and is not expired
    if (!quizCode || quizCode.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired quiz code'
      });
    }

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can join a quiz'
      });
    }

    // Automatically add participant if not already added
    const existingParticipant = await prisma.quizParticipant.findFirst({
      where: {
        quizId: quizCode.quizId,
        userId: userId
      }
    });

    if (!existingParticipant) {
      await prisma.quizParticipant.create({
        data: {
          quizId: quizCode.quizId,
          userId: userId
        }
      });
    }

    res.status(200).json({
      success: true,
      data: quizCode.quiz
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  getParticipantsForQuiz,
  addParticipantToQuiz,
  getQuizByCode
};