import { verifyToken } from '../utils/serviceProxy.js';

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Verify token with auth service
    const userData = await verifyToken(authHeader);

    if (!userData) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user data to request
    req.user = userData;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't block request
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const userData = await verifyToken(authHeader);
      if (userData) {
        req.user = userData;
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
