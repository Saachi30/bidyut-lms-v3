const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all faculty grade enrollments
 * @route   GET /api/faculty-enrollments
 * @access  Private/Admin, Institute
 */
const getFacultyEnrollments = async (req, res, next) => {
  try {
    const { facultyId, grade, instituteId } = req.query;
    const whereClause = {};

    // Filter by faculty if provided
    if (facultyId) {
      whereClause.facultyId = parseInt(facultyId);
    }

    // Filter by grade if provided
    if (grade) {
      whereClause.grade = grade;
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only see their own enrollments
      whereClause.facultyId = req.user.id;
    } else if (req.user.role === 'institute') {
      // Institutes can only see enrollments for their faculty
      const facultyMembers = await prisma.user.findMany({
        where: { 
          instituteId: req.user.instituteId,
          role: 'faculty'
        },
        select: { id: true },
      });

      const facultyIds = facultyMembers.map((f) => f.id);

      if (facultyId && !facultyIds.includes(parseInt(facultyId))) {
        const error = new Error('Not authorized to view this faculty\'s enrollments');
        error.statusCode = 403;
        return next(error);
      }

      if (!facultyId) {
        whereClause.facultyId = { in: facultyIds };
      }
    } else if (req.user.role === 'student') {
      // Students can see faculty enrollments of their assigned faculties
      const facultyRelations = await prisma.facultyStudentManagement.findMany({
        where: { studentId: req.user.id },
        select: { facultyId: true },
      });

      const facultyIds = facultyRelations.map((f) => f.facultyId);

      if (facultyId && !facultyIds.includes(parseInt(facultyId))) {
        const error = new Error('Not authorized to view this faculty\'s enrollments');
        error.statusCode = 403;
        return next(error);
      }

      if (!facultyId) {
        whereClause.facultyId = { in: facultyIds };
      }
    }

    const enrollments = await prisma.facultyGradeEnrollment.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get faculty enrollment by ID
 * @route   GET /api/faculty-enrollments/:id
 * @access  Private
 */
const getFacultyEnrollmentById = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id);

    const enrollment = await prisma.facultyGradeEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            instituteId: true,
          },
        },
      },
    });

    if (!enrollment) {
      const error = new Error('Faculty enrollment not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only view their own enrollments
      if (enrollment.facultyId !== req.user.id) {
        const error = new Error('Not authorized to view this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only view enrollments for their faculty
      const faculty = await prisma.user.findUnique({
        where: { id: enrollment.facultyId },
        select: { instituteId: true },
      });

      if (faculty.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to view this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      // Students can view enrollments of their assigned faculty
      const facultyStudentRelation = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: enrollment.facultyId,
          studentId: req.user.id,
        },
      });

      if (!facultyStudentRelation) {
        const error = new Error('Not authorized to view this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new faculty grade enrollment
 * @route   POST /api/faculty-enrollments
 * @access  Private/Admin, Institute
 */
const createFacultyEnrollment = async (req, res, next) => {
  try {
    const { facultyId, grade } = req.body;

    if (!facultyId || !grade) {
      const error = new Error('Faculty ID and Grade are required');
      error.statusCode = 400;
      return next(error);
    }

    const parsedFacultyId = parseInt(facultyId);

    // Check if faculty exists and has role 'faculty'
    const faculty = await prisma.user.findUnique({
      where: { id: parsedFacultyId },
    });

    if (!faculty || faculty.role !== 'faculty') {
      const error = new Error('Invalid faculty ID');
      error.statusCode = 400;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty cannot enroll themselves in grades
      const error = new Error('Faculty cannot enroll themselves in grades');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute') {
      // Institutes can only enroll their faculty
      if (faculty.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to enroll this faculty');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot create faculty enrollments');
      error.statusCode = 403;
      return next(error);
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.facultyGradeEnrollment.findFirst({
      where: {
        facultyId: parsedFacultyId,
        grade: grade,
      },
    });

    if (existingEnrollment) {
      const error = new Error('Faculty is already enrolled in this grade');
      error.statusCode = 400;
      return next(error);
    }

    // Create enrollment
    const enrollment = await prisma.facultyGradeEnrollment.create({
      data: {
        facultyId: parsedFacultyId,
        grade: grade,
        assignedById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete faculty grade enrollment
 * @route   DELETE /api/faculty-enrollments/:id
 * @access  Private/Admin, Institute
 */
const deleteFacultyEnrollment = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id);

    // Check if enrollment exists
    const enrollment = await prisma.facultyGradeEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      const error = new Error('Faculty enrollment not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty cannot delete their own enrollments
      const error = new Error('Faculty cannot delete enrollments');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute') {
      // Institutes can only delete enrollments for their faculty
      const faculty = await prisma.user.findUnique({
        where: { id: enrollment.facultyId },
        select: { instituteId: true },
      });

      if (faculty.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to delete this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot delete faculty enrollments');
      error.statusCode = 403;
      return next(error);
    }

    // Delete enrollment
    await prisma.facultyGradeEnrollment.delete({
      where: { id: enrollmentId },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get faculties by grade
 * @route   GET /api/faculty-enrollments/grade/:grade
 * @access  Private
 */
const getFacultiesByGrade = async (req, res, next) => {
  try {
    const { grade } = req.params;

    if (!grade) {
      const error = new Error('Grade is required');
      error.statusCode = 400;
      return next(error);
    }

    let whereClause = {
      grade: grade
    };

    // Check permissions
    if (req.user.role === 'institute') {
      // Institutes can only see faculty from their institute
      const facultyMembers = await prisma.user.findMany({
        where: { 
          instituteId: req.user.instituteId,
          role: 'faculty'
        },
        select: { id: true },
      });

      const facultyIds = facultyMembers.map((f) => f.id);
      whereClause.facultyId = { in: facultyIds };
    } else if (req.user.role === 'student') {
      // Students can only see faculty assigned to them
      const studentFaculties = await prisma.facultyStudentManagement.findMany({
        where: { studentId: req.user.id },
        select: { facultyId: true },
      });

      const facultyIds = studentFaculties.map((sf) => sf.facultyId);
      whereClause.facultyId = { in: facultyIds };
    }

    const facultyEnrollments = await prisma.facultyGradeEnrollment.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            instituteId: true,
          },
        },
      },
    });

    // Format the response to include faculty details
    const faculties = facultyEnrollments.map(enrollment => enrollment.faculty);

    res.status(200).json({
      success: true,
      count: faculties.length,
      data: faculties,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get grades by faculty
 * @route   GET /api/faculty-enrollments/faculty/:facultyId/grades
 * @access  Private
 */
const getGradesByFaculty = async (req, res, next) => {
  try {
    const facultyId = parseInt(req.params.facultyId);

    if (!facultyId) {
      const error = new Error('Faculty ID is required');
      error.statusCode = 400;
      return next(error);
    }

    // Check if faculty exists
    const faculty = await prisma.user.findUnique({
      where: { 
        id: facultyId,
        role: 'faculty'
      },
    });

    if (!faculty) {
      const error = new Error('Faculty not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && facultyId !== req.user.id) {
      const error = new Error('Not authorized to view these grades');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && faculty.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to view these grades');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'student') {
      // Check if this faculty is assigned to the student
      const relation = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: facultyId,
          studentId: req.user.id,
        },
      });

      if (!relation) {
        const error = new Error('Not authorized to view these grades');
        error.statusCode = 403;
        return next(error);
      }
    }

    const gradeEnrollments = await prisma.facultyGradeEnrollment.findMany({
      where: { facultyId },
      select: {
        id: true,
        grade: true,
        assignedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      count: gradeEnrollments.length,
      data: gradeEnrollments,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getFacultyEnrollments,
  getFacultyEnrollmentById,
  createFacultyEnrollment,
  deleteFacultyEnrollment,
  getFacultiesByGrade,
  getGradesByFaculty,
};