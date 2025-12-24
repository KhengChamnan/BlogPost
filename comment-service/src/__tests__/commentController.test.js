import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Create mocks outside of jest.mock factory
const createMocks = () => {
  const mockSaveFn = jest.fn();
  const mockFindFn = jest.fn();
  const mockFindByIdFn = jest.fn();
  const mockFindByIdAndDeleteFn = jest.fn();

  const MockModel = jest.fn().mockImplementation((data) => {
    const instance = Object.assign({}, data);
    instance.save = mockSaveFn;
    return instance;
  });

  MockModel.find = mockFindFn;
  MockModel.findById = mockFindByIdFn;
  MockModel.findByIdAndDelete = mockFindByIdAndDeleteFn;

  MockModel._mocks = {
    save: mockSaveFn,
    find: mockFindFn,
    findById: mockFindByIdFn,
    findByIdAndDelete: mockFindByIdAndDeleteFn,
  };

  return { MockModel, mocks: MockModel._mocks };
};

// Use jest.unstable_mockModule for ES modules
const { MockModel, mocks } = createMocks();

await jest.unstable_mockModule('../models/commentModel.js', () => ({
  __esModule: true,
  default: MockModel,
}));

const { create, fetchByContentId, deleteComment } = await import('../controllers/commentController.js');
const { default: commentModel } = await import('../models/commentModel.js');

describe('Comment Controller', () => {
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
    if (commentModel._mocks) {
      commentModel._mocks.save.mockClear();
      commentModel._mocks.find.mockClear();
      commentModel._mocks.findById.mockClear();
      commentModel._mocks.findByIdAndDelete.mockClear();
    }
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const mockComment = {
        _id: '507f1f77bcf86cd799439011',
        contentId: '507f1f77bcf86cd799439012',
        userId: 'user123',
        commentText: 'Great post!',
        createdAt: new Date(),
      };

      commentModel._mocks.save.mockResolvedValue(mockComment);

      req.body = {
        contentId: '507f1f77bcf86cd799439012',
        userId: 'user123',
        commentText: 'Great post!',
      };

      await create(req, res);

      // Verify commentModel was instantiated with req.body
      expect(commentModel).toHaveBeenCalledWith(req.body);
      // Verify save() was called on the instance
      expect(commentModel._mocks.save).toHaveBeenCalled();
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment created successfully',
        data: mockComment,
      });
    });

    it('should handle errors when creating a comment', async () => {
      const mockError = new Error('Database error');
      commentModel._mocks.save.mockRejectedValue(mockError);

      req.body = {
        contentId: '507f1f77bcf86cd799439012',
        userId: 'user123',
        commentText: 'Great post!',
      };

      await create(req, res);

      // Verify commentModel was instantiated
      expect(commentModel).toHaveBeenCalledWith(req.body);
      // Verify save() was called and threw an error
      expect(commentModel._mocks.save).toHaveBeenCalled();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('fetchByContentId', () => {
    it('should fetch comments by contentId successfully', async () => {
      const mockComments = [
        {
          _id: '507f1f77bcf86cd799439011',
          contentId: '507f1f77bcf86cd799439012',
          userId: 'user123',
          commentText: 'Great post!',
          createdAt: new Date(),
        },
        {
          _id: '507f1f77bcf86cd799439013',
          contentId: '507f1f77bcf86cd799439012',
          userId: 'user456',
          commentText: 'Nice article!',
          createdAt: new Date(),
        },
      ];

      commentModel._mocks.find.mockResolvedValue(mockComments);

      req.params.contentId = '507f1f77bcf86cd799439012';

      await fetchByContentId(req, res);

      expect(commentModel._mocks.find).toHaveBeenCalledWith({
        contentId: '507f1f77bcf86cd799439012',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comments fetched successfully',
        data: mockComments,
      });
    });

    it('should return 404 when no comments found', async () => {
      commentModel._mocks.find.mockResolvedValue([]);

      req.params.contentId = '507f1f77bcf86cd799439012';

      await fetchByContentId(req, res);

      expect(commentModel._mocks.find).toHaveBeenCalledWith({
        contentId: '507f1f77bcf86cd799439012',
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No comments found for this content',
      });
    });

    it('should handle errors when fetching comments', async () => {
      const mockError = new Error('Database error');
      commentModel._mocks.find.mockRejectedValue(mockError);

      req.params.contentId = '507f1f77bcf86cd799439012';

      await fetchByContentId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const mockComment = {
        _id: '507f1f77bcf86cd799439011',
        contentId: '507f1f77bcf86cd799439012',
        userId: 'user123',
        commentText: 'Great post!',
      };

      commentModel._mocks.findById.mockResolvedValue(mockComment);
      commentModel._mocks.findByIdAndDelete.mockResolvedValue(mockComment);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteComment(req, res);

      expect(commentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(commentModel._mocks.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment deleted successfully',
      });
    });

    it('should return 404 when comment not found', async () => {
      commentModel._mocks.findById.mockResolvedValue(null);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteComment(req, res);

      expect(commentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(commentModel._mocks.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment Not found',
      });
    });

    it('should handle errors when deleting a comment', async () => {
      const mockError = new Error('Database error');
      commentModel._mocks.findById.mockRejectedValue(mockError);

      req.params.id = '507f1f77bcf86cd799439011';

      await deleteComment(req, res);

      // Verify findById was called
      expect(commentModel._mocks.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      // Verify findByIdAndDelete was not called when findById throws an error
      expect(commentModel._mocks.findByIdAndDelete).not.toHaveBeenCalled();
      // Verify error response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        error: mockError,
      });
    });
  });
});
