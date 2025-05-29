const { User } = require('../../models');

describe('User Model', () => {
  it('should create user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.password).not.toBe(userData.password); // Should be hashed
  });
  
  it('should validate required fields', async () => {
    await expect(User.create({})).rejects.toThrow();
  });
  
  it('should validate email format', async () => {
    await expect(User.create({
      username: 'test',
      email: 'invalid-email',
      password: 'password123'
    })).rejects.toThrow();
  });
  
  it('should enforce unique username', async () => {
    await User.create({
      username: 'uniqueuser',
      email: 'test1@example.com',
      password: 'password123'
    });
    
    await expect(User.create({
      username: 'uniqueuser',
      email: 'test2@example.com',
      password: 'password123'
    })).rejects.toThrow();
  });
  
  it('should enforce unique email', async () => {
    await User.create({
      username: 'user1',
      email: 'unique@example.com',
      password: 'password123'
    });
    
    await expect(User.create({
      username: 'user2',
      email: 'unique@example.com',
      password: 'password123'
    })).rejects.toThrow();
  });
});