// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const { getIO } = require('../socket');

// /**
//  * @desc    Get quiz invitations for current user
//  * @route   GET /api/quiz-invitations
//  * @access  Private
//  */
// const getQuizInvitations = async (req, res, next) => {
//   try {
//     const invitations = await prisma.quizInvitation.findMany({
//       where: { 
//         receiverId: req.user.id 
//       },
//       include: {
//         quiz: {
//           select: {
//             id: true,
//             title: true
//           }
//         },
//         sender: {
//           select: {
//             id: true,
//             name: true
//           }
//         },
//         receiver: { // Add this to include receiver details
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });

//     res.json({ success: true, data: invitations });
//   } catch (error) {
//     next(error);
//   }
// };

// const sendQuizInvitation = async (req, res, next) => {
//   try {
//     const { receiverId, quizId } = req.body;

//     // Check if receiver exists
//     const receiver = await prisma.user.findUnique({
//       where: { id: parseInt(receiverId) }
//     });

//     if (!receiver || receiver.role !== 'student') {
//       const error = new Error('Invalid receiver ID');
//       error.statusCode = 400;
//       return next(error);
//     }

//     // Check if quiz exists
//     const quiz = await prisma.quiz.findUnique({
//       where: { id: parseInt(quizId) }
//     });

//     if (!quiz) {
//       const error = new Error('Quiz not found');
//       error.statusCode = 404;
//       return next(error);
//     }

//     // Create invitation
//     const invitation = await prisma.quizInvitation.create({
//       data: {
//         senderId: req.user.id,
//         receiverId: parseInt(receiverId),
//         quizId: parseInt(quizId)
//       }
//     });

//     // Add sender as a participant (if not already a participant)
//     const senderParticipant = await prisma.quizParticipant.findFirst({
//       where: {
//         quizId: parseInt(quizId),
//         userId: req.user.id
//       }
//     });

//     if (!senderParticipant) {
//       await prisma.quizParticipant.create({
//         data: {
//           quizId: parseInt(quizId),
//           userId: req.user.id,
//           isReady: false
//         }
//       });
//     }
//     // After creating invitation
//     const io = getIO();
//     io.to(`quiz_${quizId}`).emit('newInvitation', {
//       invitation,
//       receiverId: parseInt(receiverId)
//     });

//     res.status(201).json({ success: true, data: invitation });
//   } catch (error) {
//     next(error);
//   }

// };

// const acceptQuizInvitation = async (req, res, next) => {
//   try {
//     const invitationId = parseInt(req.params.id);

//     // Check if invitation exists
//     const invitation = await prisma.quizInvitation.findUnique({
//       where: { id: invitationId }
//     });

//     if (!invitation || invitation.receiverId !== req.user.id) {
//       const error = new Error('Invitation not found or not authorized');
//       error.statusCode = 404;
//       return next(error);
//     }

//     // Update invitation status
//     const updatedInvitation = await prisma.quizInvitation.update({
//       where: { id: invitationId },
//       data: {
//         status: 'accepted'
//       }
//     });

//     // Add receiver as a participant (if not already a participant)
//     const receiverParticipant = await prisma.quizParticipant.findFirst({
//       where: {
//         quizId: invitation.quizId,
//         userId: req.user.id
//       }
//     });

//     if (!receiverParticipant) {
//       await prisma.quizParticipant.create({
//         data: {
//           quizId: invitation.quizId,
//           userId: req.user.id,
//           isReady: false
//         }
//       });
//     }

//     const io = getIO();
//     io.to(`quiz_${invitation.quizId}`).emit('invitationAccepted', {
//       invitationId,
//       receiverId: req.user.id
//     });

//     res.status(200).json({ success: true, data: updatedInvitation });
//   } catch (error) {
//     next(error);
//   }
// };
// /**
//  * @desc    Decline quiz invitation
//  * @route   PUT /api/quiz-invitations/:id/decline
//  * @access  Private
//  */
// const declineQuizInvitation = async (req, res, next) => {
//   try {
//     const invitationId = parseInt(req.params.id);

//     // Check if invitation exists
//     const invitation = await prisma.quizInvitation.findUnique({
//       where: { id: invitationId }
//     });

//     if (!invitation || invitation.receiverId !== req.user.id) {
//       const error = new Error('Invitation not found or not authorized');
//       error.statusCode = 404;
//       return next(error);
//     }

//     // Update invitation status
//     const updatedInvitation = await prisma.quizInvitation.update({
//       where: { id: invitationId },
//       data: {
//         status: 'declined'
//       }
//     });

//     res.status(200).json({
//       success: true,
//       data: updatedInvitation
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   sendQuizInvitation,
//   acceptQuizInvitation,
//   declineQuizInvitation,
//   getQuizInvitations
// };
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../socket');

/**
 * @desc    Get quiz invitations for current user
 * @route   GET /api/quiz-invitations
 * @access  Private
 */
const getQuizInvitations = async (req, res, next) => {
  try {
    const invitations = await prisma.quizInvitation.findMany({
      where: { 
        receiverId: req.user.id 
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true
          }
        },
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send quiz invitation to a user
 * @route   POST /api/quiz-invitations
 * @access  Private
 */
const sendQuizInvitation = async (req, res, next) => {
  try {
    const { receiverId, quizId } = req.body;

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver || receiver.role !== 'student') {
      const error = new Error('Invalid receiver ID');
      error.statusCode = 400;
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

    // Check if invitation already exists
    const existingInvitation = await prisma.quizInvitation.findFirst({
      where: {
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        quizId: parseInt(quizId),
        status: 'pending'
      }
    });

    if (existingInvitation) {
      const error = new Error('Invitation already sent');
      error.statusCode = 400;
      return next(error);
    }

    // Create invitation
    const invitation = await prisma.quizInvitation.create({
      data: {
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        quizId: parseInt(quizId),
        status: 'pending'
      },
      include: {
        quiz: {
          select: {
            title: true
          }
        },
        sender: {
          select: {
            name: true
          }
        }
      }
    });

    // Add sender as a participant (if not already a participant)
    const senderParticipant = await prisma.quizParticipant.findFirst({
      where: {
        quizId: parseInt(quizId),
        userId: req.user.id
      }
    });

    if (!senderParticipant) {
      await prisma.quizParticipant.create({
        data: {
          quizId: parseInt(quizId),
          userId: req.user.id,
          isReady: false
        }
      });
    }

    // Send notification via Socket.IO
    const io = getIO();
    
    // Notify the specific receiver directly
    io.to(`user_${receiverId}`).emit('newInvitation', {
      invitation,
      senderId: req.user.id,
      quizId: parseInt(quizId)
    });
    
    // Also notify everyone in the quiz room (for UI updates)
    io.to(`quiz_${quizId}`).emit('quizInvitationSent', {
      invitation,
      receiverId: parseInt(receiverId)
    });

    res.status(201).json({ success: true, data: invitation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept quiz invitation
 * @route   PUT /api/quiz-invitations/:id/accept
 * @access  Private
 */
const acceptQuizInvitation = async (req, res, next) => {
  try {
    const invitationId = parseInt(req.params.id);

    // Check if invitation exists
    const invitation = await prisma.quizInvitation.findUnique({
      where: { id: invitationId },
      include: {
        quiz: true
      }
    });

    if (!invitation || invitation.receiverId !== req.user.id) {
      const error = new Error('Invitation not found or not authorized');
      error.statusCode = 404;
      return next(error);
    }

    if (invitation.status !== 'pending') {
      const error = new Error('Invitation has already been processed');
      error.statusCode = 400;
      return next(error);
    }

    // Update invitation status
    const updatedInvitation = await prisma.quizInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'accepted'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Add receiver as a participant (if not already a participant)
    const receiverParticipant = await prisma.quizParticipant.findFirst({
      where: {
        quizId: invitation.quizId,
        userId: req.user.id
      }
    });

    if (!receiverParticipant) {
      await prisma.quizParticipant.create({
        data: {
          quizId: invitation.quizId,
          userId: req.user.id,
          isReady: false
        }
      });
    }

    const io = getIO();
    
    // Notify the quiz room
    io.to(`quiz_${invitation.quizId}`).emit('invitationAccepted', {
      invitation: updatedInvitation,
      receiverId: req.user.id
    });
    
    // Notify the sender directly
    io.to(`user_${invitation.senderId}`).emit('invitationAccepted', {
      invitation: updatedInvitation,
      receiverId: req.user.id
    });

    res.status(200).json({ success: true, data: updatedInvitation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline quiz invitation
 * @route   PUT /api/quiz-invitations/:id/decline
 * @access  Private
 */
const declineQuizInvitation = async (req, res, next) => {
  try {
    const invitationId = parseInt(req.params.id);

    // Check if invitation exists
    const invitation = await prisma.quizInvitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation || invitation.receiverId !== req.user.id) {
      const error = new Error('Invitation not found or not authorized');
      error.statusCode = 404;
      return next(error);
    }

    if (invitation.status !== 'pending') {
      const error = new Error('Invitation has already been processed');
      error.statusCode = 400;
      return next(error);
    }

    // Update invitation status
    const updatedInvitation = await prisma.quizInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'declined'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    const io = getIO();
    
    // Notify the quiz room
    io.to(`quiz_${invitation.quizId}`).emit('invitationDeclined', {
      invitation: updatedInvitation,
      receiverId: req.user.id
    });
    
    // Notify the sender directly
    io.to(`user_${invitation.senderId}`).emit('invitationDeclined', {
      invitation: updatedInvitation,
      receiverId: req.user.id
    });

    res.status(200).json({
      success: true,
      data: updatedInvitation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all pending invitations for a quiz
 * @route   GET /api/quiz-invitations/quiz/:quizId
 * @access  Private
 */
const getQuizInvitationsByQuiz = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.quizId);
    
    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    });

    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      return next(error);
    }

    const invitations = await prisma.quizInvitation.findMany({
      where: { 
        quizId,
        senderId: req.user.id
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ success: true, data: invitations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendQuizInvitation,
  acceptQuizInvitation,
  declineQuizInvitation,
  getQuizInvitations,
  getQuizInvitationsByQuiz
};