const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private/Admin, Institute, Faculty
 */
const getStudents = async (req, res, next) => {
  try {
    const { instituteId, grade, courseId } = req.query;

    const whereClause = { role: 'student' };

    if (instituteId) {
      whereClause.instituteId = parseInt(instituteId);
    }

    if (grade) {
      whereClause.grade = grade;
    }

    if (courseId) {
      whereClause.enrolledCourses = {
        some: {
          courseId: parseInt(courseId),
        },
      };
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        institute: true,
        enrolledCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Private/Admin, Institute, Faculty
 */
const getStudentById = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);

    const student = await prisma.user.findUnique({
      where: { id: studentId, role: 'student' },
      include: {
        institute: true,
        enrolledCourses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private/Admin, Institute
 */
const createStudent = async (req, res, next) => {
    try {
      const { name, email, password, phoneNumber, instituteId, grade, courseIds } = req.body;
      
      // Validate required fields
      if (!name || !email || !password || !instituteId) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and instituteId are required fields'
        });
      }
  
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
  
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
  
      // Hash the password before saving it to the database
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create the student with all provided data
      const student = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'student',
          phoneNumber,
          instituteId: parseInt(instituteId),
          grade,
          // Handle course enrollments if courseIds are provided
          enrolledCourses: courseIds?.length > 0
            ? {
                create: courseIds.map((courseId) => ({
                  courseId: parseInt(courseId),
                })),
              }
            : undefined,
        },
        include: {
          institute: true,
          enrolledCourses: {
            include: {
              course: true,
            },
          },
        },
      });
  
      // Remove password from the response
      const { password: _, ...studentWithoutPassword } = student;
  
      res.status(201).json({
        success: true,
        data: studentWithoutPassword,
      });
    } catch (error) {
      console.error('Error creating student:', error);
      next(error);
    }
  };
/**
 * @desc    Update a student
 * @route   PUT /api/students/:id
 * @access  Private/Admin, Institute
 */
const updateStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);
    const { name, email, grade, courseIds } = req.body;

    const student = await prisma.user.update({
      where: { id: studentId, role: 'student' },
      data: {
        name,
        email,
        grade,
        enrolledCourses: {
          deleteMany: {}, // Remove existing course enrollments
          create: courseIds?.map((courseId) => ({
            courseId: parseInt(courseId),
          })),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin, Institute
 */
const deleteStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id: studentId, role: 'student' },
    });

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};