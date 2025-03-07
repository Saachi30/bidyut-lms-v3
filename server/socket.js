const socketio = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let io;

const initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Increase ping interval
    maxHttpBufferSize: 1e8, // Increase max buffer size to 100MB
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a quiz room
    socket.on('joinQuizRoom', async ({ quizId, userId }) => {
      try {
        const roomKey = `quiz_room_${quizId}`;
        socket.join(roomKey);

        // Notify the user that they have successfully joined the quiz room
        socket.emit('joinedQuizRoom', { quizId, userId });

        // Notify all participants that a new user has joined
        io.to(roomKey).emit('userJoined', { userId });
      } catch (error) {
        console.error('Error joining quiz room:', error);
      }
    });

    // Start quiz for all participants
    socket.on('startQuizForAll', async ({ quizId, userId }) => {
      try {
        // Verify user role and quiz existence
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });

        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: {
            participants: {
              include: {
                user: true
              }
            }
          }
        });

        // Validate user role and quiz existence
        if (!user || !quiz) {
          return;
        }

        // Check if user has permission to start quiz
        const allowedRoles = ['admin', 'faculty', 'institute'];
        if (!allowedRoles.includes(user.role)) {
          return;
        }

        const roomKey = `quiz_room_${quizId}`;

        // Broadcast quiz start to all participants
        io.to(roomKey).emit('quizStarted', {
          quizId,
          startTime: new Date().toISOString(),
          participants: quiz.participants.map(p => p.user.id)
        });

      } catch (error) {
        console.error('Error starting quiz:', error);
      }
    });

    // Handle quiz answers
    socket.on('submitAnswer', async ({ quizId, userId, questionId, answer }) => {
      try {
        const roomKey = `quiz_room_${quizId}`;

        // Save the answer to the database
        await prisma.quizAnswer.create({
          data: {
            quizId,
            userId,
            questionId,
            answer,
          }
        });

        // Broadcast the answer to all participants
        io.to(roomKey).emit('answerSubmitted', { userId, questionId, answer });
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initializeSocket, getIO };