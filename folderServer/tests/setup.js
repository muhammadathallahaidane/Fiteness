const { sequelize } = require('../models');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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