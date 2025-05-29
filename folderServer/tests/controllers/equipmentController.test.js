const request = require('supertest');
const app = require('../../app');
const { Equipment } = require('../../models');
const { createTestUser, seedBasicData } = require('../helpers/testHelpers');

describe('Equipment Controller', () => {
  let user, token;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
  });
  
  describe('GET /equipments', () => {
    it('should get all equipments successfully', async () => {
      await seedBasicData();
      
      const response = await request(app)
        .get('/equipments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
    
    it('should return empty array when no equipments exist', async () => {
      const response = await request(app)
        .get('/equipments')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/equipments')
        .expect(401);
    });
    
    it('should handle database errors', async () => {
      // Mock database error
      jest.spyOn(Equipment, 'findAll').mockRejectedValueOnce(new Error('Database error'));
      
      const response = await request(app)
        .get('/equipments')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);
      
      expect(response.body).toHaveProperty('message');
      
      // Restore mock
      Equipment.findAll.mockRestore();
    });
  });
});