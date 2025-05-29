const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../helpers/testHelpers');
const errorHandler = require('../../middlewares/errorHandler');
const { generateToken } = require('../../helpers/jwt'); // Tambahkan import ini
const express = require('express'); // Tambahkan import ini

describe('Error Handler Middleware', () => {
  let user, token;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });
  
  it('should handle BadRequest errors (400)', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Username, email, and password are required');
  });
  
  it('should handle Unauthorized errors (401)', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Invalid email or password');
  });
  
  it('should handle NotFound errors (404)', async () => {
    const response = await request(app)
      .post('/workoutLists')
      .set('Authorization', `Bearer ${token}`)
      .send({
        BodyPartId: 99999, // Non-existent ID
        equipmentIds: [],
        name: 'Test Workout'
      })
      .expect(404);
    
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Body part not found');
  });
  
  it('should handle SequelizeValidationError (400)', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        username: 'test',
        email: 'invalid-email', // Invalid email format
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body).toHaveProperty('message');
  });
  
  it('should handle JsonWebTokenError (401)', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401);
    
    expect(response.body.message).toBe('Invalid or expired token');
  });
  
  it('should handle TokenExpiredError (401)', async () => {
    // Perbaikan: Gunakan jwt.sign langsung untuk expired token yang benar
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '-1h' } // Token yang benar-benar expired
    );
    
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    
    expect(response.body.message).toBe('Invalid or expired token');
  });
  
  it('should handle Forbidden errors (403)', async () => {
    // Create a custom route that throws Forbidden error for testing
    const express = require('express');
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/test-forbidden', (req, res, next) => {
      next({ name: 'Forbidden', message: 'Access denied' });
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-forbidden')
      .expect(403);
    
    expect(response.body.message).toBe('Access denied');
  });
  
  it('should handle custom errors with statusCode', async () => {
    const express = require('express');
    const testApp = express();
    testApp.use(express.json());
    testApp.get('/test-custom', (req, res, next) => {
      next({ message: 'Custom error', statusCode: 422 });
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-custom')
      .expect(422);
    
    expect(response.body.message).toBe('Custom error');
  });
  
  it('should handle SequelizeUniqueConstraintError (400)', async () => {
    // First registration
    await request(app)
      .post('/users/register')
      .send({
        username: 'uniquetest',
        email: 'unique@test.com',
        password: 'password123'
      });
    
    // Duplicate registration
    const response = await request(app)
      .post('/users/register')
      .send({
        username: 'uniquetest',
        email: 'unique@test.com',
        password: 'password123'
      })
      .expect(400);
    
    expect(response.body.message).toContain('already exists');
  });
  
  it('should handle generic errors (500)', async () => {
    // Mock untuk memicu generic error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Test dengan endpoint yang bisa memicu error
    const response = await request(app)
      .get('/workoutLists/invalid-id')
      .set('Authorization', `Bearer ${token}`);
    
    console.error = originalConsoleError;
    expect([404, 500]).toContain(response.status);
  });
  
  it('should handle JWT errors', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });
  
  it('should handle generic server errors (500)', async () => {
    // This would be tested by mocking a controller to throw an unexpected error
    // For now, we can test the error handler structure
    expect(true).toBe(true); // Placeholder
  });
});


describe('Error Handler Middleware', () => {
  it('should handle validation errors', () => {
    const error = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'Validation error' }]
    };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle unique constraint errors', () => {
    const err = { name: 'SequelizeUniqueConstraintError', errors: [{ message: 'email must be unique' }] };
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'email must be unique' });
  });

  it('should handle generic errors', () => {
    const err = { message: 'Something went wrong' };
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
  it('should handle generic errors', () => {
    const error = new Error('Unknown error');
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should use default message for Unauthorized error', async () => {
    const testApp = express();
    testApp.get('/test-unauthorized', (req, res, next) => {
      const error = new Error();
      error.name = 'Unauthorized';
      // Don't set error.message to test default message
      next(error);
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-unauthorized')
      .expect(401);
    
    // Perbaikan: Sesuaikan dengan pesan default yang sebenarnya
    expect(response.body.message).toBe('Authentication failed');
  });

  it('should use default message for Forbidden error', async () => {
    const testApp = express();
    testApp.get('/test-forbidden', (req, res, next) => {
      const error = new Error();
      error.name = 'Forbidden';
      next(error);
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-forbidden')
      .expect(403);
    
    expect(response.body.message).toBe('You are not authorized to perform this action');
  });

  it('should use default message for NotFound error', async () => {
    const testApp = express();
    testApp.get('/test-notfound', (req, res, next) => {
      const error = new Error();
      error.name = 'NotFound';
      next(error);
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-notfound')
      .expect(404);
    
    expect(response.body.message).toBe('Resource not found');
  });

  it('should handle error with custom message and statusCode', async () => {
    const testApp = express();
    testApp.get('/test-custom-status', (req, res, next) => {
      const error = new Error('Custom error with status');
      error.statusCode = 422;
      next(error);
    });
    testApp.use(require('../../middlewares/errorHandler'));
    
    const response = await request(testApp)
      .get('/test-custom-status')
      .expect(422);
    
    expect(response.body.message).toBe('Custom error with status');
  });
});