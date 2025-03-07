const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('express-async-handler'); // For handling async errors

// @desc    Get all institutes
// @route   GET /api/institutes
// @access  Public (protected by middleware)
const getInstitutes = asyncHandler(async (req, res) => {
  const institutes = await prisma.institute.findMany({
    include: {
      users: true,
      courses: true,
      facultyStudentRelations: true,
    },
  });
  res.status(200).json(institutes);
});

// @desc    Get a single institute by ID
// @route   GET /api/institutes/:id
// @access  Public (protected by middleware)
const getInstituteById = asyncHandler(async (req, res) => {
  const institute = await prisma.institute.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      users: true,
      courses: true,
      facultyStudentRelations: true,
    },
  });

  if (!institute) {
    res.status(404);
    throw new Error('Institute not found');
  }

  res.status(200).json(institute);
});

// @desc    Create a new institute
// @route   POST /api/institutes
// @access  Admin
const createInstitute = asyncHandler(async (req, res) => {
  const { name, location, maxGrades, maxStudents } = req.body;

  const institute = await prisma.institute.create({
    data: {
      name,
      location,
      maxGrades,
      maxStudents,
    },
  });

  res.status(201).json(institute);
});

// @desc    Update an institute
// @route   PUT /api/institutes/:id
// @access  Admin
const updateInstitute = asyncHandler(async (req, res) => {
  const { name, location, maxGrades, maxStudents } = req.body;

  const updatedInstitute = await prisma.institute.update({
    where: { id: parseInt(req.params.id) },
    data: {
      name,
      location,
      maxGrades,
      maxStudents,
    },
  });

  res.status(200).json(updatedInstitute);
});

// @desc    Delete an institute
// @route   DELETE /api/institutes/:id
// @access  Admin
const deleteInstitute = asyncHandler(async (req, res) => {
  const institute = await prisma.institute.delete({
    where: { id: parseInt(req.params.id) },
  });

  if (!institute) {
    res.status(404);
    throw new Error('Institute not found');
  }

  res.status(200).json({ message: 'Institute deleted successfully' });
});

// @desc    Get users by institute ID
// @route   GET /api/institutes/:id/users
// @access  Admin or Institute-specific users
const getInstituteUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    where: { instituteId: parseInt(req.params.id) },
    include: {
      institute: true,
      createdCourses: true,
      gradeEnrollments: true,
      assignedEnrollments: true,
      facultyStudents: true,
      assignedStudents: true,
      quizReports: true,
      quizCodes: true,
      quizParticipants: true,
      contestParticipants: true,
      aiQuizReports: true,
    },
  });

  res.status(200).json(users);
});

module.exports = {
  getInstitutes,
  getInstituteById,
  createInstitute,
  updateInstitute,
  deleteInstitute,
  getInstituteUsers,
};