const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests using JWT
 * Checks Authorization header (Bearer token) or HttpOnly cookie
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'water_treatment_super_secret_jwt_key_2026'
    );

    // Find active user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed. User account not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account deactivated. Please contact your system administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
};

/**
 * Middleware to authorize requests based on user roles
 * @param  {...string} roles Allowed roles (e.g. 'Admin', 'Plant Operator', 'Monitoring Analyst')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this operation. Permitted roles: ${roles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
