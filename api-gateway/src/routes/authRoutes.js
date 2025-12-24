import express from 'express';
import { proxyRequest } from '../utils/serviceProxy.js';

const router = express.Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      AUTH_SERVICE_URL,
      '/api/auth/register',
      'POST',
      req.body,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      AUTH_SERVICE_URL,
      '/api/auth/login',
      'POST',
      req.body,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      AUTH_SERVICE_URL,
      '/api/auth/logout',
      'POST',
      req.body,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
