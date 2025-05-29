const supertest = require('supertest');
const app = require('../../app');
const request = supertest(app);
const { WorkoutList, Exercise } = require('../../models');
const { createTestUser, seedBasicData } = require('../helpers/testHelpers');
const { sequelize } = require('../../models');

// Mock AI helper - PERBAIKAN: Return JSON string instead of array
jest.mock('../../helpers/gemini.api', () => ({
  generateContent: jest.fn().mockResolvedValue([
    {
      name: 'Push-ups',
      steps: '1. Start in plank position\n2. Lower body\n3. Push back up',
      sets: 3,
      repetitions: 15,
      youtubeUrl: 'https://youtube.com/watch?v=test'
    }
  ])
}));

describe('WorkoutList Controller', () => {
  let user, token, bodyParts, equipment;
  
  beforeEach(async () => {
    const testUser = await createTestUser();
    user = testUser.user;
    token = testUser.token;
    
    const seedData = await seedBasicData();
    bodyParts = seedData.bodyParts;
    equipment = seedData.equipment;
  });
  
  describe('POST /workoutLists', () => {
 
    it('should return 401 without authentication', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      await request
        .post('/workoutLists')
        .send(workoutData)
        .expect(401);
    });

    it('should return 400 when BodyPartId is missing', async () => {
      const workoutData = {
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(400);
      
      expect(response.body.message).toBe('BodyPartId is required');
    });

    it('should return 400 when equipmentIds is not an array', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: 'not-an-array',
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(400);
      
      expect(response.body.message).toBe('equipmentIds must be an array with 0 to 2 items');
    });

    it('should return 400 when equipmentIds has more than 2 items', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id, equipment[1].id, equipment[2].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(400);
      
      expect(response.body.message).toBe('equipmentIds must be an array with 0 to 2 items');
    });

    it('should return 404 when BodyPartId does not exist', async () => {
      const workoutData = {
        BodyPartId: 99999,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(404);
      
      expect(response.body.message).toBe('Body part not found');
    });

    it('should return 404 when equipment does not exist', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [99999],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(404);
      
      expect(response.body.message).toBe('One or more equipments not found');
    });

    // AI Error Scenarios - DIPINDAHKAN KE DALAM SCOPE YANG BENAR
    it('should handle AI generation failure', async () => {
      // Mock AI to return empty array
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce([]);
      
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(500);
      
      expect(response.body.message).toContain('Failed to generate exercises from AI');
    });

    it('should handle AI returning null', async () => {
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce(null);
      
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(500);
      
      expect(response.body.message).toContain('Failed to generate exercises from AI');
    });

    it('should create workout with multiple equipment successfully', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id, equipment[1].id],
        name: 'Multi Equipment Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(201);
      
      expect(response.body.name).toBe('Multi Equipment Workout');
      expect(response.body.Exercises).toBeDefined();
      expect(response.body.Exercises.length).toBeGreaterThan(0);
    });

    it('should handle AI returning invalid exercise format', async () => {
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce([
        {
          name: 'Invalid Exercise',
          // Missing required fields
          steps: 'Some steps'
        }
      ]);
      
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(500);
      
      expect(response.body.message).toContain('AI returned exercise with missing fields');
    });

    it('should handle AI returning non-array response', async () => {
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce('not an array');
      
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      const response = await request
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(500);
      
      expect(response.body.message).toContain('AI did not return a valid array of exercises');
    });
  });
  
  describe('GET /workoutLists', () => {
    it('should get user workout lists successfully', async () => {
      const response = await request
        .get('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      await request
        .get('/workoutLists')
        .expect(401);
    });
  });

  describe('GET /workoutLists/:id', () => {
    let workoutList;

    beforeEach(async () => {
      workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
    });

    it('should get workout list by id successfully', async () => {
      const response = await request
        .get(`/workoutLists/${workoutList.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.id).toBe(workoutList.id);
      expect(response.body.name).toBe('Test Workout');
    });

    it('should return 404 for non-existent workout list', async () => {
      const response = await request
        .get('/workoutLists/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found or you are not authorized');
    });

    it('should return 401 without authentication', async () => {
      await request
        .get(`/workoutLists/${workoutList.id}`)
        .expect(401);
    });
  });

  describe('PUT /workoutLists/:workoutListId/exercises/:exerciseId', () => {
    let workoutList, exercise;
    
    beforeEach(async () => {
      // Create workout list and exercise for testing
      workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
      
      exercise = await Exercise.create({
        WorkoutListId: workoutList.id,
        EquipmentId: equipment[0].id,
        name: 'Test Exercise',
        steps: 'Test steps',
        sets: 3,
        repetitions: 10,
        youtubeUrl: 'https://youtube.com/test'
      });
    });

    it('should update exercise repetitions successfully', async () => {
      const updateData = {
        sets: 4,
        repetitions: 12
      };
      
      // PERBAIKAN: Ganti PUT menjadi PATCH
      const response = await request
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.message).toBe('Exercise updated successfully');
      expect(response.body.exercise.sets).toBe(4);
      expect(response.body.exercise.repetitions).toBe(12);
    });

    it('should return 400 when no update data provided', async () => {
      const response = await request
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('Sets or repetitions are required');
    });

    it('should return 404 for non-existent workout list', async () => {
      const response = await request
        .patch(`/workoutLists/99999/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sets: 4 })
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found or you are not authorized');
    });

    it('should return 404 for non-existent exercise', async () => {
      const response = await request
        .patch(`/workoutLists/${workoutList.id}/exercises/99999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sets: 4 })
        .expect(404);
      
      expect(response.body.message).toBe('Exercise not found in this workout list');
    });
  });

  describe('DELETE /workoutLists/:id', () => {
    let workoutList;

    beforeEach(async () => {
      workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
    });

    it('should delete workout list successfully', async () => {
      const response = await request
        .delete(`/workoutLists/${workoutList.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.message).toBe('Workout list deleted successfully');
      
      // Verify deletion
      const deletedWorkout = await WorkoutList.findByPk(workoutList.id);
      expect(deletedWorkout).toBeNull();
    });

    it('should return 404 for non-existent workout list', async () => {
      const response = await request
        .delete('/workoutLists/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found or you are not authorized');
    });

    it('should return 401 without authentication', async () => {
      await request
        .delete(`/workoutLists/${workoutList.id}`)
        .expect(401);
    });
  });
});