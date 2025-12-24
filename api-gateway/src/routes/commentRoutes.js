import express from 'express';
import { proxyRequest } from '../utils/serviceProxy.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const COMMENT_SERVICE_URL = process.env.COMMENT_SERVICE_URL;

/**
 * POST /api/comment/create
 * Create new comment (protected)
 */
router.post('/create', authMiddleware, async (req, res, next) => {
  try {
    const result = await proxyRequest(
      COMMENT_SERVICE_URL,
      '/api/comment/create',
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
 * GET /api/comment/content/:contentId
 * Get comments by content ID (public)
 */
router.get('/content/:contentId', async (req, res, next) => {
  try {
    const result = await proxyRequest(
      COMMENT_SERVICE_URL,
      `/api/comment/content/${req.params.contentId}`,
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
 * DELETE /api/comment/delete/:id
 * Delete comment (protected)
 */
router.delete('/delete/:id', authMiddleware, async (req, res, next) => {
  try {
    const result = await proxyRequest(
      COMMENT_SERVICE_URL,
      `/api/comment/delete/${req.params.id}`,
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
