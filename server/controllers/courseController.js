const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private
 */
const getCourses = async (req, res, next) => {
  try {
    const { categoryId, instituteId, grade } = req.query;

    // Build where clause based on query params and user role
    const whereClause = {};

    if (categoryId) {
      whereClause.categoryId = parseInt(categoryId);
    }

    if (grade) {
      whereClause.grade = grade;
    }

    // Filter by institute ID from query or user's institute
    if (instituteId) {
      whereClause.instituteId = parseInt(instituteId);
    } else if (req.user.role === 'institute') {
      whereClause.instituteId = req.user.instituteId;
    }

    // If user is a faculty, only show courses where they are the creator
    if (req.user.role === 'faculty') {
      whereClause.createdById = req.user.id;
    }

    // If user is a student, only show courses for their enrolled grades
    if (req.user.role === 'student') {
      const enrollments = await prisma.studentGradeEnrollment.findMany({
        where: {
          studentId: req.user.id
        },
        select: {
          grade: true
        }
      });

      whereClause.grade = {
        in: enrollments.map(e => e.grade)
      };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        instituteId: true,
        grade: true,
        createdById: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            subtopics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
const getCourseById = async (req, res, next) => {
  try {
    console.log(`Raw ID parameter: "${req.params.id}"`);
    const courseId = parseInt(req.params.id);
    console.log(`Parsed course ID: ${courseId}, type: ${typeof courseId}`);
    
    if (isNaN(courseId)) {
      const error = new Error('Invalid course ID');
      error.statusCode = 400;
      return next(error);
    }

    // Try using Number directly in the where clause
    const course = await prisma.course.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        category: true,
        institute: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        subtopics: true,
      },
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check access permissions
    if (req.user.role === 'student') {
      const enrollment = await prisma.studentGradeEnrollment.findFirst({
        where: {
          studentId: req.user.id,
          grade: course.grade,
        },
      });

      if (!enrollment) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'faculty') {
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new course
 * @route   POST /api/courses
 * @access  Private/Admin, Institute, Faculty
 */
const createCourse = async (req, res, next) => {
  try {
    const { name, description, categoryId, instituteId, grade } = req.body;

    // Determine the correct institute ID based on user role
    let finalInstituteId;
    if (req.user.role === 'admin') {
      finalInstituteId = instituteId;
    } else {
      finalInstituteId = req.user.instituteId;
    }

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!categoryExists) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check if institute exists
    const instituteExists = await prisma.institute.findUnique({
      where: { id: finalInstituteId }
    });

    if (!instituteExists) {
      const error = new Error('Institute not found');
      error.statusCode = 404;
      return next(error);
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
        instituteId: finalInstituteId,
        grade,
        createdById: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin, Institute, Faculty (creator)
 */
const updateCourse = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);
    const { name, description, categoryId, grade } = req.body;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && course.createdById !== req.user.id) {
      const error = new Error('Not authorized to update this course');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && course.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to update this course');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'student') {
      const error = new Error('Not authorized to update courses');
      error.statusCode = 403;
      return next(error);
    }

    // Validate category if provided
    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!categoryExists) {
        const error = new Error('Category not found');
        error.statusCode = 404;
        return next(error);
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        name: name || course.name,
        description: description !== undefined ? description : course.description,
        categoryId: categoryId ? parseInt(categoryId) : course.categoryId,
        grade: grade || course.grade
      }
    });

    res.status(200).json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin, Institute, Faculty (creator)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && course.createdById !== req.user.id) {
      const error = new Error('Not authorized to delete this course');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && course.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to delete this course');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'student') {
      const error = new Error('Not authorized to delete courses');
      error.statusCode = 403;
      return next(error);
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId }
    });

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get courses by institute
 * @route   GET /api/courses/institute/:instituteId
 * @access  Private
 */
const getInstitutesCourses = async (req, res, next) => {
  try {
    const instituteId = parseInt(req.params.instituteId);

    // Check if the requesting user has permission to view courses for this institute
    if (req.user.role !== 'admin' && req.user.instituteId !== instituteId) {
      const error = new Error('Not authorized to view courses for this institute');
      error.statusCode = 403;
      return next(error);
    }

    const courses = await prisma.course.findMany({
      where: { instituteId },
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        instituteId: true,
        grade: true,
        createdById: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            subtopics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get courses by grade
 * @route   GET /api/courses/grade/:grade
 * @access  Private
 */
const getGradeCourses = async (req, res, next) => {
  try {
    const grade = req.params.grade;

    // Get courses for the specified grade
    const courses = await prisma.course.findMany({
      where: { grade },
      select: {
        id: true,
        name: true,
        description: true,
        categoryId: true,
        instituteId: true,
        grade: true,
        createdById: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            subtopics: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrolled students for a grade
 * @route   GET /api/courses/grade/:grade/students
 * @access  Private/Admin, Institute, Faculty
 */
const getEnrolledStudents = async (req, res, next) => {
  try {
    const grade = req.params.grade;

    // Get enrolled students for the specified grade
    const enrollments = await prisma.studentGradeEnrollment.findMany({
      where: { grade },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            grade: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments.map(e => ({
        student: e.student,
        assignedBy: e.assignedBy,
        enrolledAt: e.assignedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstitutesCourses,
  getGradeCourses,
  getEnrolledStudents
};