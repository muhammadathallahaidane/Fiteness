const request = require('supertest');
const app = require('../../app');
const { WorkoutList, Exercise } = require('../../models');
const { createTestUser, seedBasicData } = require('../helpers/testHelpers');

// Mock AI helper
jest.mock('../../helpers/gemini.api', () => ({
  generateContent: jest.fn().mockResolvedValue([
    {
      name: 'Push-ups',
      description: 'Classic bodyweight exercise',
      steps: '1. Start in plank position\n2. Lower body\n3. Push back up',
      reps: '3 sets of 10-15 reps'
    },
    {
      name: 'Squats',
      description: 'Lower body exercise',
      steps: '1. Stand with feet apart\n2. Lower into squat\n3. Return to standing',
      reps: '3 sets of 12-20 reps'
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
    it('should create workout list successfully', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id, equipment[1].id],
        name: 'Test Workout'
      };
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(workoutData.name);
      expect(response.body.BodyPart.id).toBe(workoutData.BodyPartId);
      expect(response.body.Exercises).toHaveLength(2);
    });
    
    it('should return 401 without authentication', async () => {
      const workoutData = {
        BodyPartId: bodyParts[0].id,
        equipmentIds: [equipment[0].id],
        name: 'Test Workout'
      };
      
      await request(app)
        .post('/workoutLists')
        .send(workoutData)
        .expect(401);
    });
    
    it('should return 400 when BodyPartId is missing', async () => {
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          equipmentIds: [equipment[0].id],
          name: 'Test Workout'
        })
        .expect(400);
      
      expect(response.body.message).toBe('BodyPartId is required');
    });
    
    it('should return 400 when equipmentIds is not an array', async () => {
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: 'not-an-array',
          name: 'Test Workout'
        })
        .expect(400);
      
      expect(response.body.message).toBe('equipmentIds must be an array with 0 to 2 items');
    });
    
    it('should return 400 when equipmentIds has more than 2 items', async () => {
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id, equipment[1].id, equipment[2].id],
          name: 'Test Workout'
        })
        .expect(400);
      
      expect(response.body.message).toBe('equipmentIds must be an array with 0 to 2 items');
    });
    
    it('should return 404 when BodyPartId does not exist', async () => {
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: 99999,
          equipmentIds: [equipment[0].id],
          name: 'Test Workout'
        })
        .expect(404);
      
      expect(response.body.message).toBe('Body part not found');
    });
    
    it('should return 404 when equipment does not exist', async () => {
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [99999],
          name: 'Test Workout'
        })
        .expect(404);
      
      expect(response.body.message).toBe('One or more equipments not found');
    });
  });
  
  describe('GET /workoutLists', () => {
    it('should get user workout lists successfully', async () => {
      // Create test workout list
      const workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
      
      const response = await request(app)
        .get('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(workoutList.id);
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/workoutLists')
        .expect(401);
    });
  });
  
  describe('GET /workoutLists/:id', () => {
    it('should get specific workout list successfully', async () => {
      const workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
      
      const response = await request(app)
        .get(`/workoutLists/${workoutList.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.id).toBe(workoutList.id);
      expect(response.body.name).toBe(workoutList.name);
    });
    
    it('should return 404 when workout list does not exist', async () => {
      const response = await request(app)
        .get('/workoutLists/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found');
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/workoutLists/1')
        .expect(401);
    });
  });
  
  describe('DELETE /workoutLists/:id', () => {
    it('should delete workout list successfully', async () => {
      const workoutList = await WorkoutList.create({
        UserId: user.id,
        BodyPartId: bodyParts[0].id,
        name: 'Test Workout'
      });
      
      const response = await request(app)
        .delete(`/workoutLists/${workoutList.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.message).toBe('Workout list deleted successfully');
      
      // Verify deletion
      const deletedWorkout = await WorkoutList.findByPk(workoutList.id);
      expect(deletedWorkout).toBeNull();
    });
    
    it('should return 404 when workout list does not exist', async () => {
      const response = await request(app)
        .delete('/workoutLists/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found');
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .delete('/workoutLists/1')
        .expect(401);
    });
  });

  // Add these new test cases before the closing });
  
  describe('PATCH /workoutLists/:workoutListId/exercises/:exerciseId', () => {
    let workoutList, exercise;
    
    beforeEach(async () => {
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
      const response = await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          sets: 4,
          repetitions: 12
        })
        .expect(200);
      
      expect(response.body.message).toBe('Exercise updated successfully');
      expect(response.body.exercise.sets).toBe(4);
      expect(response.body.exercise.repetitions).toBe(12);
    });
    
    it('should update only sets when repetitions not provided', async () => {
      const response = await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sets: 5 })
        .expect(200);
      
      expect(response.body.exercise.sets).toBe(5);
      expect(response.body.exercise.repetitions).toBe(10); // unchanged
    });
    
    it('should update only repetitions when sets not provided', async () => {
      const response = await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ repetitions: 15 })
        .expect(200);
      
      expect(response.body.exercise.repetitions).toBe(15);
      expect(response.body.exercise.sets).toBe(3); // unchanged
    });
    
    it('should return 400 when no sets or repetitions provided', async () => {
      const response = await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('Sets or repetitions are required');
    });
    
    it('should return 404 when workout list not found', async () => {
      const response = await request(app)
        .patch('/workoutLists/99999/exercises/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ sets: 4 })
        .expect(404);
      
      expect(response.body.message).toBe('Workout list not found or you are not authorized');
    });
    
    it('should return 404 when exercise not found', async () => {
      const response = await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/99999`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sets: 4 })
        .expect(404);
      
      expect(response.body.message).toBe('Exercise not found in this workout list');
    });
    
    it('should return 401 without authentication', async () => {
      await request(app)
        .patch(`/workoutLists/${workoutList.id}/exercises/${exercise.id}`)
        .send({ sets: 4 })
        .expect(401);
    });
  });
  
  describe('AI Error Handling', () => {
    it('should handle AI generation failure', async () => {
      // Mock AI to return empty result
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce('[]');
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id],
          name: 'Test Workout'
        })
        .expect(500);
      
      expect(response.body.message).toContain('Failed to generate exercises from AI');
    });
    
    it('should handle AI JSON parse error', async () => {
      // Mock AI to return invalid JSON
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce('invalid json');
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id],
          name: 'Test Workout'
        })
        .expect(500);
      
      expect(response.body.message).toContain('Failed to generate exercises from AI');
    });
    
    it('should handle AI returning exercises with missing fields', async () => {
      // Mock AI to return incomplete exercise data
      const { generateContent } = require('../../helpers/gemini.api');
      generateContent.mockResolvedValueOnce(JSON.stringify([
        {
          name: 'Incomplete Exercise',
          steps: 'Some steps'
          // missing sets, repetitions, youtubeUrl
        }
      ]));
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id],
          name: 'Test Workout'
        })
        .expect(500);
      
      expect(response.body.message).toContain('AI returned exercise with missing fields');
    });
  });
});

// Tambahkan di dalam describe('POST /workoutLists')
it('should create workout list successfully with valid data', async () => {
// Mock AI response
const { generateContent } = require('../../helpers/gemini.api');
generateContent.mockResolvedValueOnce(JSON.stringify([
{
name: 'Push-ups',
steps: 'Do push-ups',
sets: 3,
repetitions: 10,
youtubeUrl: 'https://youtube.com/test'
}
]));

const response = await request(app)
.post('/workoutLists')
.set('Authorization', `Bearer ${token}`)
.send({
BodyPartId: bodyParts[0].id,
equipmentIds: [equipment[0].id],
name: 'Test Workout'
})
.expect(201);

expect(response.body).toHaveProperty('id');
expect(response.body.name).toBe('Test Workout');
expect(response.body.Exercises).toHaveLength(1);
});

it('should handle missing BodyPartId', async () => {
const response = await request(app)
.post('/workoutLists')
.set('Authorization', `Bearer ${token}`)
.send({
equipmentIds: [equipment[0].id],
name: 'Test Workout'
})
.expect(400);

expect(response.body.message).toBe('BodyPartId is required');
});

it('should handle invalid equipmentIds count', async () => {
const response = await request(app)
.post('/workoutLists')
.set('Authorization', `Bearer ${token}`)
.send({
BodyPartId: bodyParts[0].id,
equipmentIds: [], // Empty array
name: 'Test Workout'
})
.expect(400);

expect(response.body.message).toContain('equipmentIds must contain 1 to 3 equipment IDs');
});

it('should handle non-existent BodyPartId', async () => {
const response = await request(app)
.post('/workoutLists')
.set('Authorization', `Bearer ${token}`)
.send({
BodyPartId: 99999,
equipmentIds: [equipment[0].id],
name: 'Test Workout'
})
.expect(404);

expect(response.body.message).toBe('Body part not found');
});

it('should handle non-existent equipment', async () => {
const response = await request(app)
.post('/workoutLists')
.set('Authorization', `Bearer ${token}`)
.send({
BodyPartId: bodyParts[0].id,
equipmentIds: [99999],
name: 'Test Workout'
})
.expect(404);

expect(response.body.message).toBe('One or more equipments not found');
});


  describe('POST /workoutLists - Edge Cases', () => {
    it('should handle case when no exercises are generated', async () => {
      // Mock Gemini to return empty array
      const mockGenerateContent = jest.fn().mockResolvedValue([]);
      jest.doMock('../../helpers/gemini.api', () => ({
        generateContent: mockGenerateContent
      }));
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id]
        })
        .expect(500);
      
      expect(response.body.message).toContain('Failed to generate exercises');
    });
    
    it('should handle exercise validation with missing repetitions', async () => {
      // Mock Gemini to return exercise without repetitions
      const mockGenerateContent = jest.fn().mockResolvedValue([
        {
          name: 'Test Exercise',
          steps: 'Test steps',
          sets: 3
          // missing repetitions
        }
      ]);
      
      jest.doMock('../../helpers/gemini.api', () => ({
        generateContent: mockGenerateContent
      }));
      
      const response = await request(app)
        .post('/workoutLists')
        .set('Authorization', `Bearer ${token}`)
        .send({
          BodyPartId: bodyParts[0].id,
          equipmentIds: [equipment[0].id]
        })
        .expect(400);
      
      expect(response.body.message).toContain('Invalid exercise data');
    });
  });