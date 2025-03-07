const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin, Institute, Faculty
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, instituteId } = req.query;
    
    const whereClause = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (instituteId) {
      whereClause.instituteId = parseInt(instituteId);
    }
    
    if (req.user.role === 'institute') {
      whereClause.instituteId = req.user.instituteId;
    }
    
    if (req.user.role === 'faculty') {
      const managedStudents = await prisma.facultyStudentManagement.findMany({
        where: {
          facultyId: req.user.id
        },
        select: {
          studentId: true
        }
      });
      
      if (role === 'student') {
        whereClause.id = {
          in: managedStudents.map(s => s.studentId)
        };
      } else {
        whereClause.id = req.user.id;
      }
    }
    
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        grade: true,
        streakNumber: true,
        institute: {
          select: {
            id: true,
            name: true,
            maxGrades: true,
            maxStudents: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/users/students/all
 * @access  Private/Admin, Institute, Faculty
 */
const getStudents = async (req, res, next) => {
  try {
    const whereClause = { role: 'student' };

    if (req.user.role === 'institute') {
      whereClause.instituteId = req.user.instituteId;
    }

    if (req.user.role === 'faculty') {
      const managedStudents = await prisma.facultyStudentManagement.findMany({
        where: {
          facultyId: req.user.id
        },
        select: {
          studentId: true
        }
      });

      whereClause.id = {
        in: managedStudents.map(s => s.studentId)
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        grade: true,
        streakNumber: true,
        institute: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all faculties
 * @route   GET /api/users/faculties/all
 * @access  Private/Admin, Institute
 */
const getFaculties = async (req, res, next) => {
  try {
    const whereClause = { role: 'faculty' };

    if (req.user.role === 'institute') {
      whereClause.instituteId = req.user.instituteId;
    }

    const faculties = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        streakNumber: true,
        institute: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        quizReports: true,
        aiQuizReports: true,
        contestParticipants: true,
        createdCourses: true,
        gradeEnrollments: true,
        facultyStudents: true,
        assignedStudents: true,
        quizParticipants: true,
        quizCodes: true
      }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private/Admin or Institute
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, instituteId, phoneNumber, city, state, grade } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      const error = new Error('User with this email already exists');
      error.statusCode = 400;
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalInstituteId = instituteId;
    
    if (req.user.role === 'institute') {
      finalInstituteId = req.user.instituteId;
      
      if (role !== 'faculty' && role !== 'student') {
        const error = new Error('Institute can only create faculty or student users');
        error.statusCode = 403;
        return next(error);
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        instituteId: role === 'admin' ? null : finalInstituteId,
        phoneNumber,
        city,
        state,
        grade: role === 'student' ? grade : null,
        streakNumber: 0
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.instituteId,
        phoneNumber: user.phoneNumber,
        city: user.city,
        state: user.state,
        grade: user.grade
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, password, role, instituteId, phoneNumber, city, state, grade } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (req.user.role !== 'admin') {
      if (req.user.role === 'institute' && user.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to update this user');
        error.statusCode = 403;
        return next(error);
      }
      
      if (req.user.role === 'faculty' && user.id !== req.user.id) {
        const error = new Error('Not authorized to update this user');
        error.statusCode = 403;
        return next(error);
      }
      
      if (req.user.role === 'student' && user.id !== req.user.id) {
        const error = new Error('Not authorized to update this user');
        error.statusCode = 403;
        return next(error);
      }
      
      if (role && role !== user.role) {
        const error = new Error('Not authorized to change user role');
        error.statusCode = 403;
        return next(error);
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { 
          email,
          NOT: {
            id: userId
          }
        }
      });

      if (emailExists) {
        const error = new Error('Email already in use');
        error.statusCode = 400;
        return next(error);
      }
      
      updateData.email = email;
    }
    
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    
    if (grade && (user.role === 'student' || (role === 'student' && req.user.role === 'admin'))) {
      updateData.grade = grade;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    if (req.user.role === 'admin' && role) {
      updateData.role = role;
    }
    
    if (req.user.role === 'admin' && instituteId && role !== 'admin') {
      updateData.instituteId = instituteId;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        grade: true,
        streakNumber: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin or Institute
 */
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (req.user.role !== 'admin') {
      if (req.user.role === 'institute' && user.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to delete this user');
        error.statusCode = 403;
        return next(error);
      }
      
      if (req.user.role === 'faculty' || req.user.role === 'student') {
        const error = new Error('Not authorized to delete users');
        error.statusCode = 403;
        return next(error);
      }
      
      if (user.role === 'admin') {
        const error = new Error('Not authorized to delete admin users');
        error.statusCode = 403;
        return next(error);
      }
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user streak
 * @route   PATCH /api/users/:id/streak
 * @access  Private
 */
const updateUserStreak = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { streakNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (req.user.id !== userId && req.user.role !== 'admin') {
      const error = new Error('Not authorized to update streak');
      error.statusCode = 403;
      return next(error);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { streakNumber },
      select: {
        id: true,
        name: true,
        streakNumber: true
      }
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by email
 * @route   GET /api/users/email/:email
 * @access  Private
 */
const findUserByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        grade: true,
        streakNumber: true,
        createdAt: true,
        institute: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student by email
 * @route   GET /api/users/student/email/:email
 * @access  Private
 */
const findStudentByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { 
        email,
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        instituteId: true,
        phoneNumber: true,
        city: true,
        state: true,
        grade: true,
        streakNumber: true,
        createdAt: true,
        institute: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getFaculties,
  updateUserStreak,
  findUserByEmail,
  findStudentByEmail
};