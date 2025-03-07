// // const { PrismaClient } = require('@prisma/client');
// // const Redis = require('ioredis');
// // const prisma = new PrismaClient();

// // // Redis client with graceful fallback
// // let redis;
// // let redisEnabled = false;

// // try {
// //   redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
// //     // Set low connection timeout to avoid hanging the app
// //     connectTimeout: 1000,
// //     // Disable auto reconnect to avoid continuous errors
// //     maxRetriesPerRequest: 1,
// //     retryStrategy: () => null
// //   });

// //   redis.on('error', (err) => {
// //     if (!redisEnabled && (err.code === 'ECONNREFUSED' || err.code === 'NR_CLOSED')) {
// //       // Only log this message once
// //       console.log('Redis not available, running without cache');
// //       redisEnabled = false;
// //     } else if (redisEnabled) {
// //       console.error('Redis error:', err);
// //     }
// //   });

// //   redis.on('connect', () => {
// //     console.log('Redis connected successfully');
// //     redisEnabled = true;
// //   });
// // } catch (error) {
// //   console.log('Failed to initialize Redis, running without cache:', error.message);
// //   redisEnabled = false;
// // }

// // // Cache TTL in seconds (e.g., 30 minutes)
// // const CACHE_TTL = 1800;

// // // Helper function to generate cache keys
// // const getCacheKey = (prefix, params = {}) => {
// //   const queryString = Object.entries(params)
// //     .filter(([_, value]) => value !== undefined)
// //     .map(([key, value]) => `${key}:${value}`)
// //     .join(':');
  
// //   return `courses:${prefix}${queryString ? ':' + queryString : ''}`;
// // };

// // // Helper function to safely get cache
// // const getCacheData = async (key) => {
// //   if (!redisEnabled) return null;
  
// //   try {
// //     const data = await redis.get(key);
// //     return data ? JSON.parse(data) : null;
// //   } catch (error) {
// //     console.error('Error getting cache:', error);
// //     return null;
// //   }
// // };

// // // Helper function to safely set cache
// // const setCacheData = async (key, data, ttl = CACHE_TTL) => {
// //   if (!redisEnabled) return false;
  
// //   try {
// //     await redis.set(key, JSON.stringify(data), 'EX', ttl);
// //     return true;
// //   } catch (error) {
// //     console.error('Error setting cache:', error);
// //     return false;
// //   }
// // };

// // // Helper function to clear cache based on patterns
// // const clearCachePattern = async (pattern) => {
// //   if (!redisEnabled) return;
  
// //   try {
// //     const keys = await redis.keys(pattern);
// //     if (keys.length > 0) {
// //       await redis.del(...keys);
// //     }
// //   } catch (error) {
// //     console.error('Error clearing cache:', error);
// //   }
// // };

// // /**
// //  * @desc    Get all courses
// //  * @route   GET /api/courses
// //  * @access  Private
// //  */
// // const getCourses = async (req, res, next) => {
// //   try {
// //     const { categoryId, instituteId } = req.query;
    
// //     // Create a unique cache key based on query params and user role
// //     const cacheKey = getCacheKey('list', {
// //       categoryId,
// //       instituteId,
// //       userRole: req.user.role,
// //       userId: req.user.id,
// //       userInstId: req.user.instituteId
// //     });
    
// //     // Try to get data from cache
// //     const cachedData = await getCacheData(cacheKey);
// //     if (cachedData) {
// //       return res.status(200).json(cachedData);
// //     }
    
// //     // Build where clause based on query params and user role
// //     const whereClause = {};
    
// //     if (categoryId) {
// //       whereClause.categoryId = parseInt(categoryId);
// //     }
    
// //     // Filter by institute ID from query or user's institute
// //     if (instituteId) {
// //       whereClause.instituteId = parseInt(instituteId);
// //     } else if (req.user.role === 'institute') {
// //       whereClause.instituteId = req.user.instituteId;
// //     }
    
// //     // If user is a faculty, only show courses where they are the creator
// //     if (req.user.role === 'faculty') {
// //       whereClause.createdById = req.user.id;
// //     }
    
// //     // If user is a student, only show courses they are enrolled in
// //     if (req.user.role === 'student') {
// //       const enrollments = await prisma.studentCourseEnrollment.findMany({
// //         where: {
// //           studentId: req.user.id
// //         },
// //         select: {
// //           courseId: true
// //         }
// //       });
      
// //       whereClause.id = {
// //         in: enrollments.map(e => e.courseId)
// //       };
// //     }
    
// //     const courses = await prisma.course.findMany({
// //       where: whereClause,
// //       select: {
// //         id: true,
// //         name: true,
// //         description: true,
// //         categoryId: true,
// //         instituteId: true,
// //         createdById: true,
// //         createdAt: true,
// //         category: {
// //           select: {
// //             id: true,
// //             name: true
// //           }
// //         },
// //         institute: {
// //           select: {
// //             id: true,
// //             name: true
// //           }
// //         },
// //         createdBy: {
// //           select: {
// //             id: true,
// //             name: true,
// //             role: true
// //           }
// //         },
// //         _count: {
// //           select: {
// //             subtopics: true,
// //             enrollments: true
// //           }
// //         }
// //       },
// //       orderBy: {
// //         createdAt: 'desc'
// //       }
// //     });

// //     const response = {
// //       success: true,
// //       count: courses.length,
// //       data: courses
// //     };

// //     // Save to cache
// //     await setCacheData(cacheKey, response);

// //     res.status(200).json(response);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Get course by ID
// //  * @route   GET /api/courses/:id
// //  * @access  Private
// //  */
// // const getCourseById = async (req, res, next) => {
// //   try {
// //     const courseId = parseInt(req.params.id);
// //     const cacheKey = getCacheKey('detail', {
// //       id: courseId,
// //       userRole: req.user.role,
// //       userId: req.user.id,
// //       userInstId: req.user.instituteId
// //     });

// //     // Try to get data from cache
// //     const cachedData = await getCacheData(cacheKey);
// //     if (cachedData) {
// //       return res.status(200).json(cachedData);
// //     }

// //     const course = await prisma.course.findUnique({
// //       where: { id: courseId },
// //       include: {
// //         category: true,
// //         institute: true,
// //         createdBy: {
// //           select: {
// //             id: true,
// //             name: true,
// //             role: true
// //           }
// //         },
// //         subtopics: true,
// //         _count: {
// //           select: {
// //             enrollments: true
// //           }
// //         }
// //       }
// //     });

// //     if (!course) {
// //       const error = new Error('Course not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Check access permissions
// //     if (req.user.role === 'student') {
// //       // Students can only access courses they are enrolled in
// //       const enrollment = await prisma.studentCourseEnrollment.findFirst({
// //         where: {
// //           studentId: req.user.id,
// //           courseId
// //         }
// //       });
      
// //       if (!enrollment) {
// //         const error = new Error('Not authorized to access this course');
// //         error.statusCode = 403;
// //         return next(error);
// //       }
// //     } else if (req.user.role === 'faculty') {
// //       // Faculty can only access courses they created or that belong to their institute
// //       if (course.createdById !== req.user.id && course.instituteId !== req.user.instituteId) {
// //         const error = new Error('Not authorized to access this course');
// //         error.statusCode = 403;
// //         return next(error);
// //       }
// //     } else if (req.user.role === 'institute') {
// //       // Institutes can only access their own courses
// //       if (course.instituteId !== req.user.instituteId) {
// //         const error = new Error('Not authorized to access this course');
// //         error.statusCode = 403;
// //         return next(error);
// //       }
// //     }

// //     const response = {
// //       success: true,
// //       data: course
// //     };

// //     // Save to cache
// //     await setCacheData(cacheKey, response);

// //     res.status(200).json(response);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Create a new course
// //  * @route   POST /api/courses
// //  * @access  Private/Admin, Institute, Faculty
// //  */
// // const createCourse = async (req, res, next) => {
// //   try {
// //     const { name, description, categoryId, instituteId } = req.body;

// //     // Determine the correct institute ID based on user role
// //     let finalInstituteId;
// //     if (req.user.role === 'admin') {
// //       finalInstituteId = instituteId;
// //     } else {
// //       finalInstituteId = req.user.instituteId;
// //     }

// //     // Check if category exists
// //     const categoryExists = await prisma.category.findUnique({
// //       where: { id: parseInt(categoryId) }
// //     });

// //     if (!categoryExists) {
// //       const error = new Error('Category not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Check if institute exists
// //     const instituteExists = await prisma.institute.findUnique({
// //       where: { id: finalInstituteId }
// //     });

// //     if (!instituteExists) {
// //       const error = new Error('Institute not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Create course
// //     const course = await prisma.course.create({
// //       data: {
// //         name,
// //         description,
// //         categoryId: parseInt(categoryId),
// //         instituteId: finalInstituteId,
// //         createdById: req.user.id
// //       }
// //     });

// //     // Clear related caches
// //     await clearCachePattern('courses:list*');
    
// //     res.status(201).json({
// //       success: true,
// //       data: course
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Update course
// //  * @route   PUT /api/courses/:id
// //  * @access  Private/Admin, Institute, Faculty (creator)
// //  */
// // const updateCourse = async (req, res, next) => {
// //   try {
// //     const courseId = parseInt(req.params.id);
// //     const { name, description, categoryId } = req.body;

// //     // Check if course exists
// //     const course = await prisma.course.findUnique({
// //       where: { id: courseId }
// //     });

// //     if (!course) {
// //       const error = new Error('Course not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Check permissions
// //     if (req.user.role === 'faculty' && course.createdById !== req.user.id) {
// //       const error = new Error('Not authorized to update this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     } else if (req.user.role === 'institute' && course.instituteId !== req.user.instituteId) {
// //       const error = new Error('Not authorized to update this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     } else if (req.user.role === 'student') {
// //       const error = new Error('Not authorized to update courses');
// //       error.statusCode = 403;
// //       return next(error);
// //     }

// //     // Validate category if provided
// //     if (categoryId) {
// //       const categoryExists = await prisma.category.findUnique({
// //         where: { id: parseInt(categoryId) }
// //       });

// //       if (!categoryExists) {
// //         const error = new Error('Category not found');
// //         error.statusCode = 404;
// //         return next(error);
// //       }
// //     }

// //     // Update course
// //     const updatedCourse = await prisma.course.update({
// //       where: { id: courseId },
// //       data: {
// //         name: name || course.name,
// //         description: description !== undefined ? description : course.description,
// //         categoryId: categoryId ? parseInt(categoryId) : course.categoryId
// //       }
// //     });

// //     // Clear related caches
// //     await clearCachePattern(`courses:detail:id:${courseId}*`);
// //     await clearCachePattern('courses:list*');

// //     res.status(200).json({
// //       success: true,
// //       data: updatedCourse
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Delete course
// //  * @route   DELETE /api/courses/:id
// //  * @access  Private/Admin, Institute, Faculty (creator)
// //  */
// // const deleteCourse = async (req, res, next) => {
// //   try {
// //     const courseId = parseInt(req.params.id);

// //     // Check if course exists
// //     const course = await prisma.course.findUnique({
// //       where: { id: courseId }
// //     });

// //     if (!course) {
// //       const error = new Error('Course not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Check permissions
// //     if (req.user.role === 'faculty' && course.createdById !== req.user.id) {
// //       const error = new Error('Not authorized to delete this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     } else if (req.user.role === 'institute' && course.instituteId !== req.user.instituteId) {
// //       const error = new Error('Not authorized to delete this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     } else if (req.user.role === 'student') {
// //       const error = new Error('Not authorized to delete courses');
// //       error.statusCode = 403;
// //       return next(error);
// //     }

// //     // Delete course
// //     await prisma.course.delete({
// //       where: { id: courseId }
// //     });

// //     // Clear related caches
// //     await clearCachePattern(`courses:detail:id:${courseId}*`);
// //     await clearCachePattern('courses:list*');
// //     await clearCachePattern(`courses:institute:*`);
// //     await clearCachePattern(`courses:students:${courseId}`);

// //     res.status(200).json({
// //       success: true,
// //       message: 'Course deleted successfully'
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Get courses by institute
// //  * @route   GET /api/courses/institute/:instituteId
// //  * @access  Private
// //  */
// // const getInstitutesCourses = async (req, res, next) => {
// //   try {
// //     const instituteId = parseInt(req.params.instituteId);
    
// //     const cacheKey = getCacheKey('institute', {
// //       instituteId,
// //       userRole: req.user.role,
// //       userId: req.user.id,
// //       userInstId: req.user.instituteId
// //     });

// //     // Try to get data from cache
// //     const cachedData = await getCacheData(cacheKey);
// //     if (cachedData) {
// //       return res.status(200).json(cachedData);
// //     }

// //     // Check if the requesting user has permission to view courses for this institute
// //     if (req.user.role !== 'admin' && req.user.instituteId !== instituteId) {
// //       const error = new Error('Not authorized to view courses for this institute');
// //       error.statusCode = 403;
// //       return next(error);
// //     }

// //     const courses = await prisma.course.findMany({
// //       where: { instituteId },
// //       select: {
// //         id: true,
// //         name: true,
// //         description: true,
// //         categoryId: true,
// //         instituteId: true,
// //         createdById: true,
// //         createdAt: true,
// //         category: {
// //           select: {
// //             id: true,
// //             name: true
// //           }
// //         },
// //         institute: {
// //           select: {
// //             id: true,
// //             name: true
// //           }
// //         },
// //         createdBy: {
// //           select: {
// //             id: true,
// //             name: true,
// //             role: true
// //           }
// //         },
// //         _count: {
// //           select: {
// //             subtopics: true,
// //             enrollments: true
// //           }
// //         }
// //       },
// //       orderBy: {
// //         createdAt: 'desc'
// //       }
// //     });

// //     const response = {
// //       success: true,
// //       count: courses.length,
// //       data: courses
// //     };

// //     // Save to cache
// //     await setCacheData(cacheKey, response);

// //     res.status(200).json(response);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // /**
// //  * @desc    Get enrolled students for a course
// //  * @route   GET /api/courses/:id/students
// //  * @access  Private/Admin, Institute, Faculty
// //  */
// // const getEnrolledStudents = async (req, res, next) => {
// //   try {
// //     const courseId = parseInt(req.params.id);
    
// //     const cacheKey = getCacheKey('students', {
// //       courseId,
// //       userRole: req.user.role,
// //       userId: req.user.id,
// //       userInstId: req.user.instituteId
// //     });

// //     // Try to get data from cache
// //     const cachedData = await getCacheData(cacheKey);
// //     if (cachedData) {
// //       return res.status(200).json(cachedData);
// //     }

// //     // Check if course exists
// //     const course = await prisma.course.findUnique({
// //       where: { id: courseId }
// //     });

// //     if (!course) {
// //       const error = new Error('Course not found');
// //       error.statusCode = 404;
// //       return next(error);
// //     }

// //     // Check permissions
// //     if (req.user.role === 'faculty' && course.createdById !== req.user.id) {
// //       const error = new Error('Not authorized to view enrolled students for this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     } else if (req.user.role === 'institute' && course.instituteId !== req.user.instituteId) {
// //       const error = new Error('Not authorized to view enrolled students for this course');
// //       error.statusCode = 403;
// //       return next(error);
// //     }

// //     // Get enrolled students
// //     const enrollments = await prisma.studentCourseEnrollment.findMany({
// //       where: { courseId },
// //       include: {
// //         student: {
// //           select: {
// //             id: true,
// //             name: true,
// //             email: true,
// //             role: true
// //           }
// //         }
// //       }
// //     });

// //     const response = {
// //       success: true,
// //       count: enrollments.length,
// //       data: enrollments.map(e => e.student)
// //     };

// //     // Save to cache
// //     await setCacheData(cacheKey, response);

// //     res.status(200).json(response);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // module.exports = {
// //   getCourses,
// //   getCourseById,
// //   createCourse,
// //   updateCourse,
// //   deleteCourse,
// //   getInstitutesCourses,
// //   getEnrolledStudents
// // };



















////////////////////// schema/////////////////////////////



// generator client {
//     provider = "prisma-client-js"
//   }
  
//   datasource db {
//     provider = "postgresql"
//     url      = env("DATABASE_URL")
//   }
  
//   model User {
//     id            Int       @id @default(autoincrement())
//     name          String
//     email         String    @unique
//     password      String
//     role          Role      @default(student)
//     instituteId   Int?
//     phoneNumber   String?
//     city          String?
//     state         String?
//     streakNumber  Int       @default(0)
//     createdAt     DateTime  @default(now()) @map("created_at")
//     updatedAt     DateTime  @default(now()) @updatedAt @map("updated_at")
  
//     // Relationships
//     institute     Institute? @relation(fields: [instituteId], references: [id], onDelete: SetNull)
//     createdCourses        Course[]              @relation("CourseCreator")
//     enrollments           StudentCourseEnrollment[] @relation("EnrolledStudent")
//     assignedEnrollments   StudentCourseEnrollment[] @relation("AssignedBy")
//     facultyStudents       FacultyStudentManagement[] @relation("Faculty")
//     assignedStudents      FacultyStudentManagement[] @relation("Student")
//     quizReports           QuizReport[]
//     quizInvitationsSent   QuizInvitation[]      @relation("QuizInvitationSender")
//     quizInvitationsReceived QuizInvitation[]    @relation("QuizInvitationReceiver")
//     contestParticipants   ContestParticipant[]
//     aiQuizReports         AIQuizReport[]
//     quizParticipants      QuizParticipant[]     // Add this line
  
//     @@map("users")
//   }
  
//   model Institute {
//     id          Int       @id @default(autoincrement())
//     name        String    @unique
//     location    String?
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     users       User[]
//     courses     Course[]
//     facultyStudentRelations FacultyStudentManagement[]
  
//     @@map("institutes")
//   }
  
//   model Category {
//     id          Int       @id @default(autoincrement())
//     name        String    @unique
//     description String?
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     courses     Course[]
  
//     @@map("categories")
//   }
  
//   model Course {
//     id          Int       @id @default(autoincrement())
//     name        String
//     description String?
//     categoryId  Int       @map("category_id")
//     instituteId Int       @map("institute_id")
//     createdById Int       @map("created_by")
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
//     institute   Institute @relation(fields: [instituteId], references: [id], onDelete: Cascade)
//     createdBy   User      @relation("CourseCreator", fields: [createdById], references: [id], onDelete: Cascade)
//     subtopics   Subtopic[]
//     enrollments StudentCourseEnrollment[]
  
//     @@map("courses")
//   }
  
//   model StudentCourseEnrollment {
//     id          Int       @id @default(autoincrement())
//     studentId   Int       @map("student_id")
//     courseId    Int       @map("course_id")
//     assignedById Int      @map("assigned_by")
//     assignedAt  DateTime  @default(now()) @map("assigned_at")
    
//     // Relationships
//     student     User      @relation("EnrolledStudent", fields: [studentId], references: [id], onDelete: Cascade)
//     course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
//     assignedBy  User      @relation("AssignedBy", fields: [assignedById], references: [id], onDelete: Cascade)
  
//     @@unique([studentId, courseId])
//     @@map("student_course_enrollments")
//   }
  
//   model Subtopic {
//     id          Int       @id @default(autoincrement())
//     courseId    Int       @map("course_id")
//     title       String
//     pptLink     String?   @map("ppt_link")
//     videoLink   String?   @map("video_link")
//     quizId      Int?      @map("quiz_id") @unique
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
//     quiz        Quiz?     @relation(fields: [quizId], references: [id])
  
//     @@map("subtopics")
//   }
  
//   model Quiz {
//     id          Int       @id @default(autoincrement())
//     title       String
//     description String?
//     questions   Json
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     subtopic    Subtopic?
//     quizReports QuizReport[]
//     quizInvitations QuizInvitation[]
//     contest     Contest?
//     participants QuizParticipant[] // Add this line
  
//     @@map("quizzes")
//   }
  
//   model QuizReport {
//     id          Int       @id @default(autoincrement())
//     quizId      Int       @map("quiz_id")
//     userId      Int       @map("user_id")
//     score       Int
//     completed   Boolean   @default(false)
//     answers     String?   // Stored as JSON string
//     createdAt   DateTime  @default(now()) @map("created_at")
    
//     // Relationships
//     quiz        Quiz      @relation(fields: [quizId], references: [id], onDelete: Cascade)
//     user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
//     @@map("quiz_reports")
//   }
  
//   model QuizInvitation {
//     id          Int       @id @default(autoincrement())
//     senderId    Int       @map("sender_id")
//     receiverId  Int       @map("receiver_id")
//     quizId      Int       @map("quiz_id")
//     status      InvitationStatus @default(pending)
//     createdAt   DateTime  @default(now()) @map("created_at")
    
//     // Relationships
//     sender      User      @relation("QuizInvitationSender", fields: [senderId], references: [id], onDelete: Cascade)
//     receiver    User      @relation("QuizInvitationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
//     quiz        Quiz      @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
//     @@map("quiz_invitations")
//   }
  
//   model QuizParticipant {
//     id          Int       @id @default(autoincrement())
//     quizId      Int       @map("quiz_id")
//     userId      Int       @map("user_id")
//     isReady     Boolean   @default(false)
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
  
//     // Relationships
//     quiz        Quiz      @relation(fields: [quizId], references: [id], onDelete: Cascade)
//     user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
//     @@map("quiz_participants")
//   }
  
//   model Contest {
//     id          Int       @id @default(autoincrement())
//     quizId      Int       @map("quiz_id") @unique
//     startTime   DateTime  @map("start_time")
//     endTime     DateTime  @map("end_time")
//     createdAt   DateTime  @default(now()) @map("created_at")
//     updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at")
    
//     // Relationships
//     quiz        Quiz      @relation(fields: [quizId], references: [id])
//     participants ContestParticipant[]
  
//     @@map("contests")
//   }
  
//   model ContestParticipant {
//     id          Int       @id @default(autoincrement())
//     contestId   Int       @map("contest_id")
//     userId      Int       @map("user_id")
//     score       Int
//     createdAt   DateTime  @default(now()) @map("created_at")
    
//     // Relationships
//     contest     Contest   @relation(fields: [contestId], references: [id], onDelete: Cascade)
//     user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
//     @@map("contest_participants")
//   }
  
//   model AIQuizReport {
//     id          Int       @id @default(autoincrement())
//     userId      Int       @map("user_id")
//     score       Int
//     createdAt   DateTime  @default(now()) @map("created_at")
    
//     // Relationships
//     user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
//     @@map("ai_quiz_reports")
//   }
  
//   model FacultyStudentManagement {
//     id          Int       @id @default(autoincrement())
//     facultyId   Int       @map("faculty_id")
//     studentId   Int       @map("student_id")
//     instituteId Int       @map("institute_id")
//     createdAt   DateTime  @default(now()) @map("created_at")
    
//     // Relationships
//     faculty     User      @relation("Faculty", fields: [facultyId], references: [id], onDelete: Cascade)
//     student     User      @relation("Student", fields: [studentId], references: [id], onDelete: Cascade)
//     institute   Institute @relation(fields: [instituteId], references: [id], onDelete: Cascade)
  
//     @@unique([facultyId, studentId])
//     @@map("faculty_student_management")
//   }
  
//   enum Role {
//     admin
//     institute
//     faculty
//     student
//   }
  
//   enum InvitationStatus {
//     pending
//     accepted
//     declined
//   }