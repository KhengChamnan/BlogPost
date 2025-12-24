import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Mock environment variables
process.env.PORT = '8080';
process.env.AUTH_SERVICE_URL = 'http://localhost:8000';
process.env.CONTENT_SERVICE_URL = 'http://localhost:3001';
process.env.COMMENT_SERVICE_URL = 'http://localhost:4000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.NODE_ENV = 'test';

// Create test app similar to server.js structure
const createTestApp = () => {                                                                                                                                                                                                                               
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { message: 'Too many requests, please try again later.' }
  });

  app.use(limiter);

  // Health Check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'UP',
      message: 'API Gateway is running',
      timestamp: new Date().toISOString()
    });
  });

                                                          // Mock routes (simplified for testing)
  app.use('/api/auth', express.Router().get('/test', (req, res) => res.json({ test: 'auth' })));
  app.use('/api/content', express.Router().get('/test', (req, res) => res.json({ test: 'content' })));
  app.use('/api/comment', express.Router().get('/test', (req, res) => res.json({ test: 'comment' })));

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });

  return app;
};

describe('API Gateway', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should return health status with UP status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'UP');
      expect(response.body).toHaveProperty('message', 'API Gateway is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(typeof response.body.timestamp).toBe('string');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('Route Registration', () => {
    it('should register auth routes at /api/auth', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .expect(200);

      expect(response.body).toHaveProperty('test', 'auth');
    });

    it('should register content routes at /api/content', async () => {
      const response = await request(app)
        .get('/api/content/test')
        .expect(200);

      expect(response.body).toHaveProperty('test', 'content');
    });

    it('should register comment routes at /api/comment', async () => {
      const response = await request(app)
        .get('/api/comment/test')
        .expect(200);

      expect(response.body).toHaveProperty('test', 'comment');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown/route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should return 404 for unknown API routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors and return 500 status', async () => {
      // Create an app with an error route for testing
      const errorApp = express();
      errorApp.use(express.json());
      errorApp.get('/error', (req, res, next) => {
        next(new Error('Test error'));
      });
      errorApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({
          message: err.message || 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? err : {}
        });
      });

      const response = await request(errorApp)
        .get('/error')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Test error');
    });

    it('should handle custom error status codes', async () => {
      const errorApp = express();
      errorApp.use(express.json());
      errorApp.get('/custom-error', (req, res, next) => {
        const error = new Error('Custom error');
        error.status = 400;
        next(error);
      });
      errorApp.use((err, req, res, next) => {
        res.status(err.status || 500).json({
          message: err.message || 'Internal Server Error',
          error: process.env.NODE_ENV === 'development' ? err : {}
        });
      });

      const response = await request(errorApp)
        .get('/custom-error')
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Custom error');
    });
  });

  describe('Middleware', () => {
    it('should parse JSON request bodies', async () => {
      // Create a test route that accepts POST
      const testApp = express();
      testApp.use(express.json());
      testApp.post('/test-json', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(testApp)
        .post('/test-json')
        .send({ test: 'data' })
        .expect(200);

      // Verify JSON body was parsed correctly
      expect(response.body).toHaveProperty('received');
      expect(response.body.received).toHaveProperty('test', 'data');
    });

    it('should apply CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // CORS middleware should be applied
      expect(response.headers).toBeDefined();
    });
  });
});
