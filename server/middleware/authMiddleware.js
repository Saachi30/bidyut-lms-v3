const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Protect routes - Verify user authentication
 */
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { 
          id: true,
          name: true,
          email: true,
          role: true,
          instituteId: true
        }
      });

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        return next(error);
      }

      // Set user in request
      req.user = user;
      next();
    } catch (error) {
      error.statusCode = 401;
      error.message = 'Not authorized, token failed';
      return next(error);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    return next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Array of allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('User not authenticated');
      error.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error('Not authorized to access this resource');
      error.statusCode = 403;
      return next(error);
    }
    
    next();
  };
};

module.exports = { protect, authorize };