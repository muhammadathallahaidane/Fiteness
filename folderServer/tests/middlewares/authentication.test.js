const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../helpers/testHelpers');
const { generateToken } = require('../../helpers/jwt');
const jwt = require('jsonwebtoken'); // Tambahkan import ini

describe('Authentication Middleware', () => {
  let user, token;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });
  
  it('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  it('should return 401 without authorization header', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .expect(401);
    
    expect(response.body.message).toBe('Access token is missing');
  });
  
  it('should return 401 with invalid token format', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', 'InvalidFormat')
      .expect(401);
    
    expect(response.body.message).toBe('Invalid token format');
  });
  
  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });
  
  it('should return 401 when user does not exist', async () => {
    const fakeToken = generateToken({ id: 99999, email: 'fake@example.com', username: 'fake' });
    
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', `Bearer ${fakeToken}`)
      .expect(401);
    
    expect(response.body.message).toBe('User not found');
  });
  
  it('should return 401 with malformed token', async () => {
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', 'Bearer malformed.token.here')
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });
  
  it('should return 401 with expired token', async () => {
    // Perbaikan: Gunakan jwt.sign langsung untuk membuat expired token
    const expiredToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '-1h' } // Token yang sudah expired
    );
    
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    
    expect(response.body).toHaveProperty('message');
  });
  
  it('should return 401 if user has been deleted after token issued', async () => {
    // Perbaikan: Ganti generateValidToken dengan generateToken
    const token = generateToken({ id: 9999, email: 'fake@test.com', username: 'fake' });
    
    const response = await request(app)
      .get('/workoutLists')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    
    expect(response.body.message).toBe('User not found');
  });
  
  // Hapus atau perbaiki test unit yang menggunakan httpMocks
  // Ganti dengan integration test menggunakan supertest
  describe('Expired token validation', () => {
    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 1 }, 
        process.env.JWT_SECRET, 
        { expiresIn: '-1h' }
      );
      
      const response = await request(app)
        .get('/workoutLists')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      expect(response.body.message).toMatch(/expired|invalid/i);
    });
  });
});