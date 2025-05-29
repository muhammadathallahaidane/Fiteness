const request = require('supertest');
const app = require('../../app');
const { BodyPart } = require('../../models');
const { createTestUser, seedBasicData } = require('../helpers/testHelpers');

describe('BodyPart Controller', () => {
  let user, token;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });
  
  describe('GET /bodyParts', () => {
    it('should get all body parts successfully', async () => {
      await seedBasicData();
      
      const response = await request(app)
        .get('/bodyParts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
    
    it('should return empty array when no body parts exist', async () => {
      const response = await request(app)
        .get('/bodyParts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/bodyParts')
        .expect(401);
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      jest.spyOn(BodyPart, 'findAll').mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .get('/bodyParts')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);
      
      expect(response.body).toHaveProperty('message');
      
      // Restore mock
      BodyPart.findAll.mockRestore();
    });
  });
  
  // CRUD operations tests removed
});