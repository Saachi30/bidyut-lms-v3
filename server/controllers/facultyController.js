const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @desc    Get all faculties
 * @route   GET /api/faculties
 * @access  Private/Admin, Institute
 */
const getFaculties = async (req, res, next) => {
  try {
    const { instituteId, courseId } = req.query;

    const whereClause = { role: 'faculty' };

    if (instituteId) {
      whereClause.instituteId = parseInt(instituteId);
    }

    if (courseId) {
      whereClause.createdCourses = {
        some: {
          id: parseInt(courseId),
        },
      };
    }

    const faculties = await prisma.user.findMany({
      where: whereClause,
      include: {
        institute: true,
        createdCourses: true,
      },
    });

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
 * @desc    Get a single faculty by ID
 * @route   GET /api/faculties/:id
 * @access  Private/Admin, Institute
 */
const getFacultyById = async (req, res, next) => {
  try {
    const facultyId = parseInt(req.params.id);

    const faculty = await prisma.user.findUnique({
      where: { id: facultyId, role: 'faculty' },
      include: {
        institute: true,
        createdCourses: true,
      },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new faculty
 * @route   POST /api/faculties
 * @access  Private/Admin, Institute
 */
const createFaculty = async (req, res, next) => {
  try {
    const { name, email, password, instituteId, courseIds } = req.body;

    const faculty = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: 'faculty',
        instituteId: parseInt(instituteId),
        createdCourses: {
          connect: courseIds?.map((courseId) => ({ id: parseInt(courseId) })),
        },
      },
    });

    res.status(201).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a faculty
 * @route   PUT /api/faculties/:id
 * @access  Private/Admin, Institute
 */
const updateFaculty = async (req, res, next) => {
  try {
    const facultyId = parseInt(req.params.id);
    const { name, email, courseIds } = req.body;

    const faculty = await prisma.user.update({
      where: { id: facultyId, role: 'faculty' },
      data: {
        name,
        email,
        createdCourses: {
          set: [], // Remove existing course connections
          connect: courseIds?.map((courseId) => ({ id: parseInt(courseId) })),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a faculty
 * @route   DELETE /api/faculties/:id
 * @access  Private/Admin, Institute
 */
const deleteFaculty = async (req, res, next) => {
  try {
    const facultyId = parseInt(req.params.id);

    await prisma.user.delete({
      where: { id: facultyId, role: 'faculty' },
    });

    res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};