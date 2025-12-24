import express from 'express';
import { proxyRequest } from '../utils/serviceProxy.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL;

/**
 * POST /api/content/create
 * Create new content (protected)
 */
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User information not available' });
    }
    
    // Add authorId from authenticated user
    const requestBody = {
      ...req.body,
      authorId: req.user.id.toString()
    };
    
    const result = await proxyRequest(
      CONTENT_SERVICE_URL,
      '/api/content/create',
      'POST',
      requestBody,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/getAllContent
 * Get all content (public)
 */
router.get('/getAllContent', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      CONTENT_SERVICE_URL,
      '/api/content/getAllContent',
      'GET',
      null,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/getContent/:id
 * Get single content by ID (public)
 */
router.get('/getContent/:id', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      CONTENT_SERVICE_URL,
      `/api/content/getContent/${req.params.id}`,
      'GET',
      null,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/content/update/:id
 * Update content (protected)
 */
router.put('/update/:id', authMiddleware, async (req, res, next) => {
  try {
    // Ensure authorId is included for updates
    const requestBody = {
      ...req.body,
      authorId: req.user.id.toString()
    };
    
    const result = await proxyRequest(
      CONTENT_SERVICE_URL,
      `/api/content/update/${req.params.id}`,
      'PUT',
      requestBody,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/content/delete/:id
 * Delete content (protected)
 */
router.delete('/delete/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await proxyRequest(
      CONTENT_SERVICE_URL,
      `/api/content/delete/${req.params.id}`,
      'DELETE',
      null,
      req.headers
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
