const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');
const { createTestUser } = require('../helpers/testHelpers');
const { OAuth2Client } = require('google-auth-library');

// Mock Google OAuth
jest.mock('google-auth-library');

describe('User Controller', () => {
  describe('POST /users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe(userData.username);
      expect(response.body.email).toBe(userData.email);
      expect(response.body).not.toHaveProperty('password');
      
      // Verify user exists in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
    });
    
    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({ username: 'testuser' })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 when email already exists', async () => {
      await createTestUser({ email: 'existing@example.com' });
      
      const response = await request(app)
        .post('/users/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 400 when username already exists', async () => {
      await createTestUser({ username: 'existinguser' });
      
      const response = await request(app)
        .post('/users/register')
        .send({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('message');
    });
    
    it('should handle database connection error during registration', async () => {
      // Mock database error
      const { User } = require('../../models');
      const originalCreate = User.create;
      User.create = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      const response = await request(app)
        .post('/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(500);
      
      User.create = originalCreate;
      expect(response.body).toHaveProperty('message');
    });
    
    it('should handle invalid password during login', async () => {
      // Register user first
      await request(app)
        .post('/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
  
  describe('POST /users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/users/login')
        .send({
          email: user.email,
          password: 'password123'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.username).toBe(user.username);
      expect(response.body.email).toBe(user.email);
    });
    
    it('should return 401 with invalid email', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid email or password');
    });
    
    it('should return 401 with invalid password', async () => {
      const { user } = await createTestUser();
      
      const response = await request(app)
        .post('/users/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid email or password');
    });
    
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ password: 'password123' })
        .expect(400);
      
      expect(response.body.message).toBe('Email and password are required');
    });
    
    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({ email: 'test@example.com' })
        .expect(400);
      
      expect(response.body.message).toBe('Email and password are required');
    });
  });
  
  // Tambahkan di akhir file
  describe('POST /users/google-login', () => {
    it('should handle successful Google login for existing user', async () => {
      // Mock Google client
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: user.email,
          name: user.username,
          sub: 'google-id-123'
        })
      });
      
      require('google-auth-library').OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
  
      const response = await request(app)
        .post('/users/google-login')
        .send({ idToken: 'valid-google-token' })
        .expect(200);
  
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.email).toBe(user.email);
    });
  
    it('should handle successful Google login for new user', async () => {
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'newuser@gmail.com',
          name: 'New User',
          sub: 'google-id-456'
        })
      });
      
      require('google-auth-library').OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
  
      const response = await request(app)
        .post('/users/google-login')
        .send({ idToken: 'valid-google-token' })
        .expect(200);
  
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.email).toBe('newuser@gmail.com');
    });
    
    it('should handle Google login when user already exists', async () => {
      // Create existing user first
      const existingUser = await User.create({
        username: 'existinguser',
        email: 'existing@gmail.com',
        password: 'hashedpassword'
      });
      
      const mockVerifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => ({
          email: 'existing@gmail.com',
          name: 'Existing User',
          sub: 'google-id-existing'
        })
      });
      
      require('google-auth-library').OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
  
      const response = await request(app)
        .post('/users/google-login')
        .send({ idToken: 'valid-google-token' })
        .expect(200);
  
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.email).toBe('existing@gmail.com');
      expect(response.body.username).toBe('existinguser');
    });
    
    it('should handle malformed Google response gracefully', async () => {
      jest.spyOn(googleAuth, 'verifyIdToken').mockResolvedValueOnce({});
      const req = { body: { idToken: 'malformed' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      await userController.googleLogin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Google token' });
    });
    
    it('should login successfully with valid Google token', async () => {
      const mockPayload = {
        email: 'google@example.com',
        name: 'Google User'
      };
      
      const mockTicket = {
        getPayload: jest.fn().mockReturnValue(mockPayload)
      };
      
      const mockClient = {
        verifyIdToken: jest.fn().mockResolvedValue(mockTicket)
      };
      
      OAuth2Client.mockImplementation(() => mockClient);
      
      const response = await request(app)
        .post('/users/google-login')
        .send({ idToken: 'valid-google-token' })
        .expect(200);
      
      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(mockPayload.email);
      expect(response.body.user.username).toBe(mockPayload.name);
    });
    
    it('should return 400 when idToken is missing', async () => {
      const response = await request(app)
        .post('/users/google-login')
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('Google ID token is required');
    });
    
    it('should handle invalid Google token', async () => {
      const mockClient = {
        verifyIdToken: jest.fn().mockRejectedValue(new Error('Invalid token'))
      };
      
      OAuth2Client.mockImplementation(() => mockClient);
      
      const response = await request(app)
        .post('/users/google-login')
        .send({ idToken: 'invalid-token' })
        .expect(500);
      
      expect(response.body).toHaveProperty('message');
    });
  });
})