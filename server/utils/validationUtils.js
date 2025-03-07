const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'institute', 'faculty', 'student').required(),
  instituteId: Joi.number().allow(null)
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Institute validation schema
const instituteSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  location: Joi.string().allow('', null)
});

// Category validation schema
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow('', null)
});

// Course validation schema
const courseSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().allow('', null),
  categoryId: Joi.number().required(),
  instituteId: Joi.number().required()
});

// Subtopic validation schema
const subtopicSchema = Joi.object({
  courseId: Joi.number().required(),
  title: Joi.string().min(3).max(255).required(),
  pptLink: Joi.string().uri().allow('', null),
  videoLink: Joi.string().uri().allow('', null),
  quizLink: Joi.string().uri().allow('', null)
});

// Enrollment validation schema
const enrollmentSchema = Joi.object({
  studentId: Joi.number().required(),
  courseId: Joi.number().required()
});

// Faculty-Student validation schema
const facultyStudentSchema = Joi.object({
  facultyId: Joi.number().required(),
  studentId: Joi.number().required(),
  instituteId: Joi.number().allow(null)
});

/**
 * Validate data against schema
 * @param {Object} schema - Joi schema
 * @param {Object} data - Data to validate
 * @returns {Object} - Validation result
 */
const validate = (schema, data) => {
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  userSchema,
  loginSchema,
  instituteSchema,
  categorySchema,
  courseSchema,
  subtopicSchema,
  enrollmentSchema,
  facultyStudentSchema,
  validate
};