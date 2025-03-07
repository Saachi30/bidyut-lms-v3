// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const { getIO } = require('../socket');

// /**
//  * @desc    Mark user as ready for quiz competition
//  * @route   POST /api/quiz-competition/:quizId/ready
//  * @access  Private
//  */
// const markUserAsReady = async (req, res, next) => {
//   try {
//     const { quizId } = req.params;
//     const userId = req.user.id;

//     // Check if the user is a participant in the quiz
//     const participant = await prisma.quizParticipant.findFirst({
//       where: {
//         quizId: parseInt(quizId),
//         userId: userId
//       }
//     });

//     if (!participant) {
//       const error = new Error('User is not a participant in this quiz');
//       error.statusCode = 404;
//       return next(error);
//     }

//     // Update the participant's ready status
//     await prisma.quizParticipant.update({
//       where: { id: participant.id },
//       data: { isReady: true }
//     });

//     // Check if all participants are ready
//     const participants = await prisma.quizParticipant.findMany({
//       where: { quizId: parseInt(quizId) }
//     });

//     const allReady = participants.every(p => p.isReady);

//     const io = getIO();
//     io.to(`quiz_${quizId}`).emit('participantReady', {
//       userId: req.user.id,
//       allReady
//     });

//     res.status(200).json({ success: true, data: { allReady, participants } });
//   } catch (error) {
//     next(error);
//   }
// };
// /**
//  * @desc    Get participants for a quiz competition
//  * @route   GET /api/quiz-competition/:id/participants
//  * @access  Private
//  */
// const getQuizParticipants = async (req, res, next) => {
//     try {
//       const { id } = req.params;
  
//       // Fetch participants for the quiz
//       const participants = await prisma.quizParticipant.findMany({
//         where: {
//           quizId: parseInt(id)
//         },
//         include: {
//           user: {
//             select: {
//               id: true,
//               name: true
//             }
//           }
//         }
//       });
  
//       res.status(200).json({
//         success: true,
//         data: participants
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

// module.exports = {
//   markUserAsReady,
//   getQuizParticipants
// };

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket');

// Store active quiz timers
const activeQuizTimers = new Map();

/**
 * @desc    Mark user as ready for quiz competition
 * @route   POST /api/quiz-competition/:quizId/ready
 * @access  Private
 */
const markUserAsReady = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const parsedQuizId = parseInt(quizId);
    const userId = req.user.id;

    // Check if the user is a participant in the quiz
    const participant = await prisma.quizParticipant.findFirst({
      where: {
        quizId: parsedQuizId,
        userId: userId
      }
    });

    if (!participant) {
      const error = new Error('User is not a participant in this quiz');
      error.statusCode = 404;
      return next(error);
    }

    // Update the participant's ready status
    await prisma.quizParticipant.update({
      where: { id: participant.id },
      data: { isReady: true }
    });

    // Fetch the quiz title
    const quiz = await prisma.quiz.findUnique({
      where: { id: parsedQuizId },
      select: { 
        title: true,
        description: true
      }
    });
    
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if all participants are ready
    const participants = await prisma.quizParticipant.findMany({
      where: { quizId: parsedQuizId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const allReady = participants.every(p => p.isReady);
    const io = getIO();

    // Notify participants about ready status change
    io.to(`quiz_${quizId}`).emit('participantReady', {
      userId: req.user.id,
      userName: req.user.name,
      allReady,
      participants
    });

    // Start the timer ONLY if ALL participants are ready (and timer isn't already running)
    if (allReady && !activeQuizTimers.has(parsedQuizId)) {
      // Default time limit in seconds (5 minutes)
      const timeLimit = 10; // Shortened to 10 seconds for testing purposes
      const startTime = Date.now();
      const endTime = startTime + (timeLimit * 1000);

      // Notify all participants that timer is starting
      io.to(`quiz_${quizId}`).emit('quizTimerStarted', {
        quizId: parsedQuizId,
        startTime,
        endTime,
        timeLimit,
        quizTitle: quiz.title
      });

      // Setup interval for countdown updates
      const interval = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
        
        // Send timer update to all participants
        io.to(`quiz_${quizId}`).emit('quizTimerUpdate', {
          quizId: parsedQuizId,
          remainingTime,
          endTime
        });
        
        // When timer reaches zero
        if (remainingTime <= 0) {
          clearInterval(interval);
          activeQuizTimers.delete(parsedQuizId);
          
          // Notify all participants that the timer has ended and quiz can start
          io.to(`quiz_${quizId}`).emit('quizTimerEnded', {
            quizId: parsedQuizId,
            canStartQuiz: true
          });
        }
      }, 1000); // Update every second
      
      // Store the timer data
      activeQuizTimers.set(parsedQuizId, {
        interval,
        startTime,
        endTime,
        timeLimit
      });
    }

    res.status(200).json({ 
      success: true, 
      data: { 
        allReady, 
        participants 
      } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle quiz completion for all participants
 * @param   {number} quizId - ID of the quiz
 */
const handleQuizCompletion = async (quizId) => {
  try {
    // Update all participants to mark the quiz as completed
    await prisma.quizParticipant.updateMany({
      where: { quizId },
      data: { 
        isCompleted: true,
        completedAt: new Date()
      }
    });
    
    // You could also calculate scores here if needed
    
    console.log(`Quiz ${quizId} has been completed for all participants`);
  } catch (error) {
    console.error('Error handling quiz completion:', error);
  }
};

/**
 * @desc    Cancel an active quiz timer
 * @route   POST /api/quiz-competition/:quizId/cancel-timer
 * @access  Private (Admin or quiz creator only)
 */
const cancelQuizTimer = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const parsedQuizId = parseInt(quizId);
    
    // Check if user is admin or quiz creator
    const quiz = await prisma.quiz.findUnique({
      where: { id: parsedQuizId }
    });
    
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check authorization (only creator or admin can cancel)
    if (quiz.createdBy !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to cancel this quiz timer');
      error.statusCode = 403;
      return next(error);
    }
    
    // Cancel the timer if it exists
    if (activeQuizTimers.has(parsedQuizId)) {
      clearInterval(activeQuizTimers.get(parsedQuizId).interval);
      activeQuizTimers.delete(parsedQuizId);
      
      // Notify all participants
      const io = getIO();
      io.to(`quiz_${quizId}`).emit('quizTimerCancelled', {
        quizId: parsedQuizId,
        cancelledBy: req.user.id
      });
      
      res.status(200).json({
        success: true,
        message: 'Quiz timer cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No active timer for this quiz'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get participants for a quiz competition
 * @route   GET /api/quiz-competition/:id/participants
 * @access  Private
 */
const getQuizParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch participants for the quiz
    const participants = await prisma.quizParticipant.findMany({
      where: {
        quizId: parseInt(id)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Check if there's an active timer for this quiz
    const parsedQuizId = parseInt(id);
    const timerActive = activeQuizTimers.has(parsedQuizId);
    const timerData = timerActive ? {
      startTime: activeQuizTimers.get(parsedQuizId).startTime,
      endTime: activeQuizTimers.get(parsedQuizId).endTime,
      timeLimit: activeQuizTimers.get(parsedQuizId).timeLimit,
      remainingTime: Math.max(0, Math.floor((activeQuizTimers.get(parsedQuizId).endTime - Date.now()) / 1000))
    } : null;

    res.status(200).json({
      success: true,
      data: participants,
      timerInfo: {
        timerActive,
        timerData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz timer status
 * @route   GET /api/quiz-competition/:quizId/timer
 * @access  Private
 */
const getQuizTimerStatus = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const parsedQuizId = parseInt(quizId);
    
    const timerActive = activeQuizTimers.has(parsedQuizId);
    let timerData = null;
    
    if (timerActive) {
      const timer = activeQuizTimers.get(parsedQuizId);
      const now = Date.now();
      timerData = {
        startTime: timer.startTime,
        endTime: timer.endTime,
        timeLimit: timer.timeLimit,
        remainingTime: Math.max(0, Math.floor((timer.endTime - now) / 1000))
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        timerActive,
        timerData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markUserAsReady,
  getQuizParticipants,
  cancelQuizTimer,
  getQuizTimerStatus
};