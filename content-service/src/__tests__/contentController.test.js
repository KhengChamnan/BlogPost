import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Create mocks outside of jest.mock factory
const createMocks = () => {
  const mockSaveFn = jest.fn();
  const mockFindFn = jest.fn();
  const mockFindByIdFn = jest.fn();
  const mockFindByIdAndUpdateFn = jest.fn();
  const mockFindByIdAndDeleteFn = jest.fn();

  const MockModel = jest.fn().mockImplementation((data) => {
    const instance = Object.assign({}, data);
    instance.save = mockSaveFn;
    return instance;
  });

  MockModel.find = mockFindFn;
  MockModel.findById = mockFindByIdFn;
  MockModel.findByIdAndUpdate = mockFindByIdAndUpdateFn;
  MockModel.findByIdAndDelete = mockFindByIdAndDeleteFn;

  MockModel._mocks = {
    save: mockSaveFn,
    find: mockFindFn,
    findById: mockFindByIdFn,
    findByIdAndUpdate: mockFindByIdAndUpdateFn,
    findByIdAndDelete: mockFindByIdAndDeleteFn,
  };

  return { MockModel, mocks: MockModel._mocks };
};

// Use jest.unstable_mockModule for ES modules
const { MockModel, mocks } = createMocks();

await jest.unstable_mockModule('../models/contentModel.js', () => ({
  __esModule: true,
  default: MockModel,
}));

const { create, fetch, fetchById, update, deleteContent } = await import('../controllers/contentController.js');
const { default: contentModel } = await import('../models/contentModel.js');

describe('Content Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
    
    // Reset mocks
    if (contentModel._mocks) {
      contentModel._mocks.save.mockClear();
      contentModel._mocks.find.mockClear();
      contentModel._mocks.findById.mockClear();
      contentModel._mocks.findByIdAndUpdate.mockClear();
      contentModel._mocks.findByIdAndDelete.mockClear();
    }
  });

  describe('create', () => {
    it('should create content successfully', async () => {
      const mockContent = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Title',
        body: 'Test Body',
        authorId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contentModel._mocks.save.mockResolvedValue(mockContent);

      req.body = {
        title: 'Test Title',
        body: 'Test Body',
        authorId: 'user123',
      };

      await create(req, res);

      // Verify contentModel was instantiated with req.body
      expect(contentModel).toHaveBeenCalledWith(req.body);
      // Verify save() was called on the instance
      expect(contentModel._mocks.save).toHaveBeenCalled();
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content created successfully',
        data: mockContent,
      });
    });

    it('should handle errors when creating content', async () => {
      const mockError = new Error('Database error');
      contentModel._mocks.save.mockRejectedValue(mockError);

      req.body = {
        title: 'Test Title',
        body: 'Test Body',
        authorId: 'user123',
      };

      await create(req, res);

      // Verify contentModel was instantiated
      expect(contentModel).toHaveBeenCalledWith(req.body);
      // Verify save() was called and threw an error
      expect(contentModel._mocks.save).toHaveBeenCalled();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('fetchById', () => {
    it('should fetch content by id successfully', async () => {
      const mockContent = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Title',
        body: 'Test Body',
        authorId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      contentModel._mocks.findById.mockResolvedValue(mockContent);

      req.params.id = '507f1f77bcf86cd799439011';

      await fetchById(req, res);

      // Verify findById was called with correct id
      expect(contentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content fetched successfully',
        data: mockContent,
      });
    });

    it('should return 404 when content not found', async () => {
      contentModel._mocks.findById.mockResolvedValue(null);

      req.params.id = '507f1f77bcf86cd799439011';

      await fetchById(req, res);

      // Verify findById was called with correct id
      expect(contentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      // Verify 404 response when content not found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content Not found',
      });
    });

    it('should handle errors when fetching content by id', async () => {
      const mockError = new Error('Database error');
      contentModel._mocks.findById.mockRejectedValue(mockError);

      req.params.id = '507f1f77bcf86cd799439011';

      await fetchById(req, res);

      // Verify findById was called
      expect(contentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('fetch', () => {
    it('should fetch all contents successfully', async () => {
      const mockContents = [
        {
          _id: '507f1f77bcf86cd799439011',
          title: 'Test Title 1',
          body: 'Test Body 1',
          authorId: 'user123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439012',
          title: 'Test Title 2',
          body: 'Test Body 2',
          authorId: 'user456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      contentModel._mocks.find.mockResolvedValue(mockContents);

      await fetch(req, res);

      // Verify find was called with no parameters
      expect(contentModel._mocks.find).toHaveBeenCalledWith();
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Contents fetched successfully',
        data: mockContents,
      });
    });

    it('should return 404 when no contents found', async () => {
      contentModel._mocks.find.mockResolvedValue([]);

      await fetch(req, res);

      // Verify find was called
      expect(contentModel._mocks.find).toHaveBeenCalledWith();
      // Verify 404 response when no contents found
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content Not found',
      });
    });

    it('should handle errors when fetching contents', async () => {
      const mockError = new Error('Database error');
      contentModel._mocks.find.mockRejectedValue(mockError);

      await fetch(req, res);

      // Verify find was called
      expect(contentModel._mocks.find).toHaveBeenCalledWith();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('update', () => {
    it('should update content successfully', async () => {
      const existingContent = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Old Title',
        body: 'Old Body',
        authorId: 'user123',
      };

      const updatedContent = {
        _id: '507f1f77bcf86cd799439011',
        title: 'New Title',
        body: 'New Body',
        authorId: 'user123',
        updatedAt: new Date(),
      };

      contentModel._mocks.findById.mockResolvedValue(existingContent);
      contentModel._mocks.findByIdAndUpdate.mockResolvedValue(updatedContent);

      req.params.id = '507f1f77bcf86cd799439011';
      req.body = {
        title: 'New Title',
        body: 'New Body',
      };

      await update(req, res);

      // Verify findById was called to check if content exists
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndUpdate was called with correct parameters
      expect(contentModel._mocks.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: '507f1f77bcf86cd799439011' },
        { $set: req.body },
        { new: true }
      );
      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content updated successfully',
        data: updatedContent,
      });
    });

    it('should return 404 when content not found for update', async () => {
      contentModel._mocks.findById.mockResolvedValue(null);

      req.params.id = '507f1f77bcf86cd799439011';
      req.body = {
        title: 'New Title',
      };

      await update(req, res);

      // Verify findById was called to check if content exists
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndUpdate was not called when content doesn't exist
      expect(contentModel._mocks.findByIdAndUpdate).not.toHaveBeenCalled();
      // Verify 404 response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content Not found',
      });
    });

    it('should handle errors when updating content', async () => {
      const mockError = new Error('Database error');
      contentModel._mocks.findById.mockRejectedValue(mockError);

      req.params.id = '507f1f77bcf86cd799439011';
      req.body = {
        title: 'New Title',
      };

      await update(req, res);

      // Verify findById was called
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndUpdate was not called when error occurs
      expect(contentModel._mocks.findByIdAndUpdate).not.toHaveBeenCalled();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      const mockContent = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Test Title',
        body: 'Test Body',
        authorId: 'user123',
      };

      contentModel._mocks.findById.mockResolvedValue(mockContent);
      contentModel._mocks.findByIdAndDelete.mockResolvedValue(mockContent);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteContent(req, res);

      // Verify findById was called to check if content exists
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndDelete was called with correct id
      expect(contentModel._mocks.findByIdAndDelete).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content deleted successfully',
      });
    });

    it('should return 404 when content not found for deletion', async () => {
      contentModel._mocks.findById.mockResolvedValue(null);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteContent(req, res);

      // Verify findById was called to check if content exists
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndDelete was not called when content doesn't exist
      expect(contentModel._mocks.findByIdAndDelete).not.toHaveBeenCalled();
      // Verify 404 response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Content Not found',
      });
    });

    it('should handle errors when deleting content', async () => {
      const mockError = new Error('Database error');
      contentModel._mocks.findById.mockRejectedValue(mockError);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteContent(req, res);

      // Verify findById was called
      expect(contentModel._mocks.findById).toHaveBeenCalledWith({ _id: '507f1f77bcf86cd799439011' });
      // Verify findByIdAndDelete was not called when error occurs
      expect(contentModel._mocks.findByIdAndDelete).not.toHaveBeenCalled();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });
});
