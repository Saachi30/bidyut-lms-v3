const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all faculty-student relationships
 * @route   GET /api/faculty-students
 * @access  Private/Admin, Institute, Faculty
 */
const getFacultyStudents = async (req, res, next) => {
  try {
    const { facultyId, studentId, instituteId } = req.query;
    const whereClause = {};
    
    // Filter by faculty if provided
    if (facultyId) {
      whereClause.facultyId = parseInt(facultyId);
    }
    
    // Filter by student if provided
    if (studentId) {
      whereClause.studentId = parseInt(studentId);
    }
    
    // Filter by institute if provided
    if (instituteId) {
      whereClause.instituteId = parseInt(instituteId);
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only see their own student relationships
      whereClause.facultyId = req.user.id;
    } else if (req.user.role === 'institute') {
      // Institutes can only see relationships in their institute
      whereClause.instituteId = req.user.instituteId;
    } else if (req.user.role === 'student') {
      // Students can only see their own relationships
      whereClause.studentId = req.user.id;
    }

    const facultyStudents = await prisma.facultyStudentManagement.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: facultyStudents.length,
      data: facultyStudents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get faculty-student relationship by ID
 * @route   GET /api/faculty-students/:id
 * @access  Private
 */
const getFacultyStudentById = async (req, res, next) => {
  try {
    const relationshipId = parseInt(req.params.id);

    const facultyStudent = await prisma.facultyStudentManagement.findUnique({
      where: { id: relationshipId },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!facultyStudent) {
      const error = new Error('Faculty-student relationship not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && facultyStudent.facultyId !== req.user.id) {
      const error = new Error('Not authorized to view this relationship');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && facultyStudent.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to view this relationship');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'student' && facultyStudent.studentId !== req.user.id) {
      const error = new Error('Not authorized to view this relationship');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: facultyStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new faculty-student relationship
 * @route   POST /api/faculty-students
 * @access  Private/Admin, Institute, Faculty
 */
const createFacultyStudent = async (req, res, next) => {
  try {
    const { facultyId, studentId, instituteId } = req.body;

    if (!facultyId || !studentId) {
      const error = new Error('Faculty ID and Student ID are required');
      error.statusCode = 400;
      return next(error);
    }

    const parsedFacultyId = parseInt(facultyId);
    const parsedStudentId = parseInt(studentId);
    let parsedInstituteId = instituteId ? parseInt(instituteId) : null;

    // Check if faculty exists and has role 'faculty'
    const faculty = await prisma.user.findUnique({
      where: { id: parsedFacultyId }
    });

    if (!faculty || faculty.role !== 'faculty') {
      const error = new Error('Invalid faculty ID');
      error.statusCode = 400;
      return next(error);
    }

    // Check if student exists and has role 'student'
    const student = await prisma.user.findUnique({
      where: { id: parsedStudentId }
    });

    if (!student || student.role !== 'student') {
      const error = new Error('Invalid student ID');
      error.statusCode = 400;
      return next(error);
    }

    // If institute ID is not provided, use the faculty's institute
    if (!parsedInstituteId && faculty.instituteId) {
      parsedInstituteId = faculty.instituteId;
    }

    // Check if institute exists
    if (parsedInstituteId) {
      const institute = await prisma.institute.findUnique({
        where: { id: parsedInstituteId }
      });

      if (!institute) {
        const error = new Error('Institute not found');
        error.statusCode = 404;
        return next(error);
      }
    }

    // Check permissions
    if (req.user.role === 'faculty') {
      // Faculty can only add students to themselves
      if (parsedFacultyId !== req.user.id) {
        const error = new Error('Faculty can only add students to themselves');
        error.statusCode = 403;
        return next(error);
      }
      
      // And only within their institute
      if (faculty.instituteId && parsedInstituteId && faculty.instituteId !== parsedInstituteId) {
        const error = new Error('Cannot add students from different institutes');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'institute') {
      // Institutes can only add relationships within their institute
      if (parsedInstituteId !== req.user.instituteId) {
        const error = new Error('Can only add relationships within your institute');
        error.statusCode = 403;
        return next(error);
      }
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot create faculty-student relationships');
      error.statusCode = 403;
      return next(error);
    }

    // Check if relationship already exists
    const existingRelationship = await prisma.facultyStudentManagement.findFirst({
      where: {
        facultyId: parsedFacultyId,
        studentId: parsedStudentId,
      }
    });

    if (existingRelationship) {
      const error = new Error('Faculty-student relationship already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Create the relationship
    const facultyStudent = await prisma.facultyStudentManagement.create({
      data: {
        facultyId: parsedFacultyId,
        studentId: parsedStudentId,
        instituteId: parsedInstituteId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        institute: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: facultyStudent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a faculty-student relationship
 * @route   DELETE /api/faculty-students/:id
 * @access  Private/Admin, Institute, Faculty
 */
const deleteFacultyStudent = async (req, res, next) => {
  try {
    const relationshipId = parseInt(req.params.id);

    // Check if relationship exists
    const facultyStudent = await prisma.facultyStudentManagement.findUnique({
      where: { id: relationshipId }
    });

    if (!facultyStudent) {
      const error = new Error('Faculty-student relationship not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && facultyStudent.facultyId !== req.user.id) {
      const error = new Error('Not authorized to delete this relationship');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && facultyStudent.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to delete this relationship');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'student') {
      const error = new Error('Students cannot delete faculty-student relationships');
      error.statusCode = 403;
      return next(error);
    }

    // Delete the relationship
    await prisma.facultyStudentManagement.delete({
      where: { id: relationshipId }
    });

    res.status(200).json({
      success: true,
      message: 'Faculty-student relationship deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get students by faculty ID
 * @route   GET /api/faculty-students/faculty/:facultyId/students
 * @access  Private/Admin, Institute, Faculty
 */
const getStudentsByFaculty = async (req, res, next) => {
  try {
    const facultyId = parseInt(req.params.facultyId);

    // Check if faculty exists
    const faculty = await prisma.user.findUnique({
      where: { 
        id: facultyId,
        role: 'faculty'
      }
    });

    if (!faculty) {
      const error = new Error('Faculty not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'faculty' && facultyId !== req.user.id) {
      const error = new Error('Not authorized to view these students');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && faculty.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to view these students');
      error.statusCode = 403;
      return next(error);
    }

    // Get all students for this faculty
    const students = await prisma.facultyStudentManagement.findMany({
      where: { facultyId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            instituteId: true
          }
        }
      }
    });

    // Format response to return only student data
    const formattedStudents = students.map(relation => relation.student);

    res.status(200).json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get faculties by student ID
 * @route   GET /api/faculty-students/student/:studentId/faculties
 * @access  Private/Admin, Institute, Faculty, Student
 */
const getFacultiesByStudent = async (req, res, next) => {
  try {
    const studentId = parseInt(req.params.studentId);

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { 
        id: studentId,
        role: 'student'
      }
    });

    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      return next(error);
    }

    // Check permissions
    if (req.user.role === 'student' && studentId !== req.user.id) {
      const error = new Error('Not authorized to view these faculties');
      error.statusCode = 403;
      return next(error);
    } else if (req.user.role === 'institute' && student.instituteId !== req.user.instituteId) {
      const error = new Error('Not authorized to view these faculties');
      error.statusCode = 403;
      return next(error);
    }

    // Get all faculties for this student
    const faculties = await prisma.facultyStudentManagement.findMany({
      where: { studentId },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            email: true,
            instituteId: true
          }
        }
      }
    });

    // Format response to return only faculty data
    const formattedFaculties = faculties.map(relation => relation.faculty);

    res.status(200).json({
      success: true,
      count: formattedFaculties.length,
      data: formattedFaculties
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyStudents,
  getFacultyStudentById,
  createFacultyStudent,
  deleteFacultyStudent,
  getStudentsByFaculty,
  getFacultiesByStudent
};