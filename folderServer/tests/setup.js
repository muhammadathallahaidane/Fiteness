const { sequelize } = require('../models');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Set environment variables untuk testing
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';

// Setup database sebelum semua test
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Jalankan migrations untuk test environment
    await execAsync('npx sequelize db:migrate --env test');
    console.log('Migrations completed successfully.');
    
  } catch (error) {
    console.error('Unable to setup test database:', error);
  }
});

// Cleanup setelah semua test
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
});

// Clean up setelah setiap test
afterEach(async () => {
  try {
    // Truncate semua tabel - GUNAKAN NAMA TABEL YANG BENAR (PLURAL)
    await sequelize.query('TRUNCATE TABLE "Users", "WorkoutLists", "Exercises", "BodyParts", "Equipments" RESTART IDENTITY CASCADE');
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
});