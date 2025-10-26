import { Request, Response } from 'express';
import { register, login, getMe, logout } from '../../../src/controllers/auth.controller';
import prisma from '../../../src/config/database';
import * as passwordUtils from '../../../src/utils/password';
import * as jwtUtils from '../../../src/utils/jwt';

// Mock dependencies
jest.mock('../../../src/config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/jwt');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      body: {},
      user: undefined,
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'StrongP@ssw0rd',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+2348012345678',
      state: 'Lagos',
      lga: 'Ikeja',
      role: 'FARMER',
    };

    it('should register a new user successfully', async () => {
      mockRequest.body = validRegistrationData;

      const mockUser = {
        id: 'user-123',
        email: validRegistrationData.email,
        firstName: validRegistrationData.firstName,
        lastName: validRegistrationData.lastName,
        phoneNumber: validRegistrationData.phoneNumber,
        state: validRegistrationData.state,
        lga: validRegistrationData.lga,
        role: 'FARMER',
        isVerified: false,
        createdAt: new Date(),
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (passwordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: mockUser,
          ...mockTokens,
        },
      });
    });

    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'test123' };

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required',
      });
    });

    it('should return 400 if state or lga is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd',
      };

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'State and Local Government Area are required',
      });
    });

    it('should return 400 if password is weak', async () => {
      mockRequest.body = {
        ...validRegistrationData,
        password: 'weak',
      };

      (passwordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 8 characters long'],
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Password does not meet requirements',
        errors: ['Password must be at least 8 characters long'],
      });
    });

    it('should return 409 if user already exists', async () => {
      mockRequest.body = validRegistrationData;

      (passwordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: validRegistrationData.email,
      });

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'User with this email already exists',
      });
    });

    it('should return 500 on database error', async () => {
      mockRequest.body = validRegistrationData;

      (passwordUtils.validatePasswordStrength as jest.Mock).mockReturnValue({
        isValid: true,
        errors: [],
      });
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await register(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Registration failed',
      });
    });
  });

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'StrongP@ssw0rd',
    };

    it('should login user successfully', async () => {
      mockRequest.body = loginCredentials;

      const mockUser = {
        id: 'user-123',
        email: loginCredentials.email,
        passwordHash: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+2348012345678',
        state: 'Lagos',
        lga: 'Ikeja',
        role: 'FARMER',
        isVerified: false,
        profileImage: null,
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateTokens as jest.Mock).mockReturnValue(mockTokens);

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        message: 'Login successful',
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
          }),
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
        }),
      });
    });

    it('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'test123' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email and password are required',
      });
    });

    it('should return 401 if user not found', async () => {
      mockRequest.body = loginCredentials;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email or password',
      });
    });

    it('should return 401 if password is incorrect', async () => {
      mockRequest.body = loginCredentials;

      const mockUser = {
        id: 'user-123',
        email: loginCredentials.email,
        passwordHash: 'hashed-password',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid email or password',
      });
    });

    it('should return 500 on database error', async () => {
      mockRequest.body = loginCredentials;
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Login failed',
      });
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockRequest.user = { userId: 'user-123', email: 'test@example.com', role: 'FARMER' };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+2348012345678',
        state: 'Lagos',
        lga: 'Ikeja',
        role: 'FARMER',
        isVerified: false,
        profileImage: null,
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await getMe(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser },
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getMe(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized',
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.user = { userId: 'user-123', email: 'test@example.com', role: 'FARMER' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await getMe(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should return 500 on database error', async () => {
      mockRequest.user = { userId: 'user-123', email: 'test@example.com', role: 'FARMER' };
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getMe(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to fetch user profile',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await logout(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'success',
        message: 'Logout successful',
      });
    });
  });
});
