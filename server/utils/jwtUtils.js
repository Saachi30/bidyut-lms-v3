const jwt = require('jsonwebtoken');

/**
 * Generate access token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role,
      instituteId: user.instituteId 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '1h' }
  );
};

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};