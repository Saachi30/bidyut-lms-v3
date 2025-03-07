const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const instituteRoutes = require('./instituteRoutes');
const categoryRoutes = require('./categoryRoutes');
const courseRoutes = require('./courseRoutes');
const subtopicRoutes = require('./subtopicRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const facultyStudentRoutes = require('./facultyStudentRoutes');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/institutes', instituteRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);
router.use('/subtopics', subtopicRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/faculty-students', facultyStudentRoutes);

// Base route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LMS API is running',
    apiVersion: '1.0.0',
    documentation: '/api/docs'
  });
});

module.exports = router;