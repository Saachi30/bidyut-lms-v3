const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all subtopics for a course
 * @route   GET /api/subtopics?courseId=:courseId
 * @access  Private
 */
const getSubtopics = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    
    if (!courseId) {
      const error = new Error('Course ID is required');
      error.statusCode = 400;
      return next(error);
    }

    const parsedCourseId = parseInt(courseId);
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parsedCourseId }
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'student') {
      // Students can only access courses they are enrolled in
      const enrollment = await prisma.studentCourseEnrollment.findFirst({
        where: {
          studentId: req.user.id,
          courseId: parsedCourseId
        }
      });
      
      if (!enrollment) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can only access courses they created or from their institute
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only access their courses
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    }

    const subtopics = await prisma.subtopic.findMany({
      where: { courseId: parsedCourseId },
      orderBy: { id: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: subtopics.length,
      data: subtopics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subtopic by ID
 * @route   GET /api/subtopics/:id
 * @access  Private
 */
const getSubtopicById = async (req, res, next) => {
  try {
    const subtopicId = parseInt(req.params.id);

    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: {
        course: true
      }
    });

    if (!subtopic) {
      const error = new Error('Subtopic not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'student') {
      // Students can only access courses they are enrolled in
      const enrollment = await prisma.studentCourseEnrollment.findFirst({
        where: {
          studentId: req.user.id,
          courseId: subtopic.courseId
        }
      });
      
      if (!enrollment) {
        const error = new Error('Not authorized to access this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can only access courses they created or from their institute
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only access their courses
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    }

    res.status(200).json({
      success: true,
      data: subtopic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new subtopic
 * @route   POST /api/subtopics
 * @access  Private/Admin, Institute, Faculty
 */
const createSubtopic = async (req, res, next) => {
  try {
    const { courseId, title, pptLink, videoLink, quizId } = req.body;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });

    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only add subtopics to courses they created or from their institute
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to add subtopics to this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only add subtopics to their courses
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to add subtopics to this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Not authorized to add subtopics');
      error.statusCode = 403;
      return next(error);
    }

    // Create subtopic
    const subtopic = await prisma.subtopic.create({
      data: {
        courseId: parseInt(courseId),
        title,
        pptLink,
        videoLink,
        quizId
      }
    });

    res.status(201).json({
      success: true,
      data: subtopic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subtopic
 * @route   PUT /api/subtopics/:id
 * @access  Private/Admin, Institute, Faculty
 */
const updateSubtopic = async (req, res, next) => {
  try {
    const subtopicId = parseInt(req.params.id);
    const { title, pptLink, videoLink, quizId } = req.body;

    // Check if subtopic exists
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId },
      include: {
        course: true
      }
    });

    if (!subtopic) {
      const error = new Error('Subtopic not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only update subtopics for courses they created or from their institute
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to update this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only update subtopics for their courses
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to update this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Not authorized to update subtopics');
      error.statusCode = 403;
      return next(error);
    }

    // Update subtopic
    const updatedSubtopic = await prisma.subtopic.update({
      where: { id: subtopicId },
      data: {
        title,
        pptLink,
        videoLink,
        quizId,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: updatedSubtopic
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subtopic
 * @route   DELETE /api/subtopics/:id
 * @access  Private/Admin, Institute, Faculty
 */
const deleteSubtopic = async (req, res, next) => {
  try {
    const subtopicId = parseInt(req.params.id);

    // Check if subtopic exists
    const subtopic = await prisma.subtopic.findUnique({
      where: { id: subtopicId }
    });

    if (!subtopic) {
      const error = new Error('Subtopic not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only delete subtopics for courses they created or from their institute
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to delete this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only delete subtopics for their courses
      const course = await prisma.course.findUnique({
        where: { id: subtopic.courseId }
      });
      
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to delete this subtopic');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Not authorized to delete subtopics');
      error.statusCode = 403;
      return next(error);
    }

    // Delete subtopic
    await prisma.subtopic.delete({
      where: { id: subtopicId }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subtopics by course
 * @route   GET /api/subtopics/course/:courseId
 * @access  Private
 */
const getCourseSubtopics = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);

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
    if (req.user.role === 'student') {
      // Students can only access courses they are enrolled in (same grade)
      const enrollment = await prisma.studentGradeEnrollment.findFirst({
        where: {
          studentId: req.user.id,
          grade: course.grade // Check if the student is enrolled in the same grade
        }
      });

      if (!enrollment) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'faculty') {
      // Faculty can only access courses they created or from their institute
      if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only access their courses
      if (course.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to access this course');
        error.statusCode = 403;
        return next(error);
      }
    }

    // Fetch subtopics for the course
    const subtopics = await prisma.subtopic.findMany({
      where: { courseId },
      orderBy: { id: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: subtopics.length,
      data: subtopics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubtopics,
  getSubtopicById,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
  getCourseSubtopics
};