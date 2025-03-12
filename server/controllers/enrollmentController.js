const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all student enrollments
 * @route   GET /api/enrollments
 * @access  Private/Admin, Institute, Faculty
 */
const getEnrollments = async (req, res, next) => {
  try {
    const { studentId, grade, instituteId } = req.query;
    const whereClause = {};
    // Filter by student if provided
    if (studentId) {
      whereClause.studentId = parseInt(studentId);
    }
    // Filter by grade if provided
    if (grade) {
      whereClause.grade = grade;
    }
    // Check permissions
    if (req.user.role === 'faculty') {
      // First, check if faculty is enrolled in the requested grade
      if (grade) {
        const facultyGradeEnrollment = await prisma.facultyGradeEnrollment.findFirst({
          where: {
            facultyId: req.user.id,
            grade: grade,
          },
        });
        if (!facultyGradeEnrollment) {
          const error = new Error('Not authorized to view enrollments for this grade');
          error.statusCode = 403;
          return next(error);
        }
      }
      // Faculty can only see enrollments for their students
      const facultyStudents = await prisma.facultyStudentManagement.findMany({
        where: { facultyId: req.user.id },
        select: { studentId: true },
      });
      const studentIds = facultyStudents.map((fs) => fs.studentId);
      if (studentId && !studentIds.includes(parseInt(studentId))) {
        const error = new Error('Not authorized to view this student\'s enrollments');
        error.statusCode = 403;
        return next(error);
      }
      if (!studentId) {
        whereClause.studentId = { in: studentIds };
      }
      // Faculty can only see grades they're enrolled in if no specific grade is requested
      if (!grade) {
        const facultyGrades = await prisma.facultyGradeEnrollment.findMany({
          where: { facultyId: req.user.id },
          select: { grade: true },
        });
        const grades = facultyGrades.map((fg) => fg.grade);
        whereClause.grade = { in: grades };
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only see enrollments for their grades
      const students = await prisma.user.findMany({
        where: { instituteId: req.user.instituteId },
        select: { id: true },
      });
      const studentIds = students.map((s) => s.id);
      if (studentId && !studentIds.includes(parseInt(studentId))) {
        const error = new Error('Not authorized to view this student\'s enrollments');
        error.statusCode = 403;
        return next(error);
      }
      if (!studentId) {
        whereClause.studentId = { in: studentIds };
      }
    } else if (req.user.role === 'student') {
      // Students can only see their own enrollments
      whereClause.studentId = req.user.id;
    }
    const enrollments = await prisma.studentGradeEnrollment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            role: true,
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
 * @desc    Get enrollment by ID
 * @route   GET /api/enrollments/:id
 * @access  Private
 */
const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id);

    const enrollment = await prisma.studentGradeEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            instituteId: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!enrollment) {
      const error = new Error('Enrollment not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Check if faculty is enrolled in this grade
      const facultyGradeEnrollment = await prisma.facultyGradeEnrollment.findFirst({
        where: {
          facultyId: req.user.id,
          grade: enrollment.grade,
        },
      });
      
      if (!facultyGradeEnrollment) {
        const error = new Error('Not authorized to view enrollments for this grade');
        error.statusCode = 403;
        return next(error);
      }

      // Check if student is assigned to this faculty
      const facultyStudent = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: req.user.id,
          studentId: enrollment.studentId,
        },
      });

      if (!facultyStudent) {
        const error = new Error('Not authorized to view this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only view enrollments for their students
      if (enrollment.student.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to view this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      // Students can only view their own enrollments
      if (enrollment.studentId !== req.user.id) {
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
 * @desc    Create a new enrollment
 * @route   POST /api/enrollments
 * @access  Private/Admin, Institute, Faculty
 */
const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, grade } = req.body;

    if (!studentId || !grade) {
      const error = new Error('Student ID and Grade are required');
      error.statusCode = 400;
      return next(error);
    }

    const parsedStudentId = parseInt(studentId);

    // Check if student exists and has role 'student'
    const student = await prisma.user.findUnique({
      where: { id: parsedStudentId },
    });

    if (!student || student.role !== 'student') {
      const error = new Error('Invalid student ID');
      error.statusCode = 400;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Check if faculty is enrolled in this grade
      const facultyGradeEnrollment = await prisma.facultyGradeEnrollment.findFirst({
        where: {
          facultyId: req.user.id,
          grade: grade,
        },
      });
      
      if (!facultyGradeEnrollment) {
        const error = new Error('Not authorized to enroll students in this grade');
        error.statusCode = 403;
        return next(error);
      }

      // Faculty can only enroll their students
      const facultyStudent = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: req.user.id,
          studentId: parsedStudentId,
        },
      });

      if (!facultyStudent) {
        const error = new Error('Not authorized to enroll this student');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only enroll their students
      if (student.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to enroll this student');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot create enrollments');
      error.statusCode = 403;
      return next(error);
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.studentGradeEnrollment.findFirst({
      where: {
        studentId: parsedStudentId,
        grade: grade,
      },
    });

    if (existingEnrollment) {
      const error = new Error('Student is already enrolled in this grade');
      error.statusCode = 400;
      return next(error);
    }

    // Create enrollment
    const enrollment = await prisma.studentGradeEnrollment.create({
      data: {
        studentId: parsedStudentId,
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
 * @desc    Delete enrollment
 * @route   DELETE /api/enrollments/:id
 * @access  Private/Admin, Institute, Faculty
 */
const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollmentId = parseInt(req.params.id);

    // Check if enrollment exists
    const enrollment = await prisma.studentGradeEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            instituteId: true,
          },
        },
      },
    });

    if (!enrollment) {
      const error = new Error('Enrollment not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Check if faculty is enrolled in this grade
      const facultyGradeEnrollment = await prisma.facultyGradeEnrollment.findFirst({
        where: {
          facultyId: req.user.id,
          grade: enrollment.grade,
        },
      });
      
      if (!facultyGradeEnrollment) {
        const error = new Error('Not authorized to manage enrollments for this grade');
        error.statusCode = 403;
        return next(error);
      }

      // Check if student is assigned to this faculty
      const facultyStudent = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: req.user.id,
          studentId: enrollment.studentId,
        },
      });

      if (!facultyStudent) {
        const error = new Error('Not authorized to delete this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only delete enrollments for their students
      if (enrollment.student.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to delete this enrollment');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot delete enrollments');
      error.statusCode = 403;
      return next(error);
    }

    // Delete enrollment
    await prisma.studentGradeEnrollment.delete({
      where: { id: enrollmentId },
    });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Enrollment successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by grade
 * @route   GET /api/enrollments/grade/:grade/students
 * @access  Private/Admin, Institute, Faculty
 */
const getStudentsByGrade = async (req, res, next) => {
  try {
    const { grade } = req.params;

    if (!grade) {
      const error = new Error('Grade is required');
      error.statusCode = 400;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Check if faculty is enrolled in this grade
      const facultyGradeEnrollment = await prisma.facultyGradeEnrollment.findFirst({
        where: {
          facultyId: req.user.id,
          grade: grade,
        },
      });
      
      if (!facultyGradeEnrollment) {
        const error = new Error('Not authorized to view students for this grade');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      // Students can only see students in their own grade
      const studentGrade = await prisma.studentGradeEnrollment.findFirst({
        where: {
          studentId: req.user.id,
          grade: grade,
        },
      });

      if (!studentGrade) {
        const error = new Error('Not authorized to view students for this grade');
        error.statusCode = 403;
        return next(error);
      }
    }

    let whereClause = {
      grade: grade
    };

    // Additional filtering
    if (req.user.role === 'faculty') {
      // Faculty can only see their assigned students
      const facultyStudents = await prisma.facultyStudentManagement.findMany({
        where: { facultyId: req.user.id },
        select: { studentId: true },
      });

      const studentIds = facultyStudents.map((fs) => fs.studentId);
      whereClause.studentId = { in: studentIds };
    } else if (req.user.role === 'institute') {
      // Institutes can only see their students
      const instituteStudents = await prisma.user.findMany({
        where: { 
          instituteId: req.user.instituteId,
          role: 'student' 
        },
        select: { id: true },
      });

      const studentIds = instituteStudents.map((student) => student.id);
      whereClause.studentId = { in: studentIds };
    }

    const enrollments = await prisma.studentGradeEnrollment.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            city: true,
            state: true,
          },
        },
      },
    });

    // Format response to include student details
    const students = enrollments.map(enrollment => ({
      id: enrollment.student.id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      phoneNumber: enrollment.student.phoneNumber,
      city: enrollment.student.city,
      state: enrollment.student.state,
      enrollmentId: enrollment.id,
      grade: enrollment.grade,
      enrolledAt: enrollment.assignedAt
    }));

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
 * @desc    Get grades by student
 * @route   GET /api/enrollments/student/:studentId/grades
 * @access  Private
 */
const getGradesByStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.studentId);

    if (!studentId) {
      const error = new Error('Student ID is required');
      error.statusCode = 400;
      return next(error);
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { 
        id: studentId,
        role: 'student'
      },
    });

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only view grades for their students
      const facultyStudent = await prisma.facultyStudentManagement.findFirst({
        where: {
          facultyId: req.user.id,
          studentId: studentId,
        },
      });

      if (!facultyStudent) {
        const error = new Error('Not authorized to view grades for this student');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only view grades for their students
      if (student.instituteId !== req.user.instituteId) {
        const error = new Error('Not authorized to view grades for this student');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      // Students can only view their own grades
      if (studentId !== req.user.id) {
        const error = new Error('Not authorized to view grades for this student');
        error.statusCode = 403;
        return next(error);
      }
    }

    const gradeEnrollments = await prisma.studentGradeEnrollment.findMany({
      where: { studentId },
      select: {
        id: true,
        grade: true,
        assignedAt: true,
        assignedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
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
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  deleteEnrollment,
  getStudentsByGrade,
  getGradesByStudent,
};