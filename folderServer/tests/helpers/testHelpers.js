const { User, BodyPart, Equipment } = require('../../models');
const { generateToken } = require('../../helpers/jwt');

// Helper untuk membuat user test
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const user = await User.create({ ...defaultUser, ...userData });
  const token = generateToken({ id: user.id, email: user.email, username: user.username });
  
  return { user, token };
};

// Helper untuk membuat body part test
const createTestBodyPart = async (name = 'Test Body Part') => {
  return await BodyPart.create({ name });
};

// Helper untuk membuat equipment test
const createTestEquipment = async (name = 'Test Equipment') => {
  return await Equipment.create({ name });
};

// Helper untuk seed data dasar
const seedBasicData = async () => {
  const bodyParts = await BodyPart.bulkCreate([
    { name: 'Chest' },
    { name: 'Back' },
    { name: 'Legs' },
    { name: 'Arms' }
  ]);
  
  const equipment = await Equipment.bulkCreate([
    { name: 'Dumbbells' },
    { name: 'Barbell' },
    { name: 'Resistance Bands' },
    { name: 'Bodyweight' }
  ]);
  
  return { bodyParts, equipment };
};

module.exports = {
  createTestUser,
  createTestBodyPart,
  createTestEquipment,
  seedBasicData
};