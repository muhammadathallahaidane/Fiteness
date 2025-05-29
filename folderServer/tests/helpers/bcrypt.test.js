const { hashPassword, comparePassword } = require('../../helpers/bcrypt');

describe('Bcrypt Helper', () => {
  const plainPassword = 'testpassword123';
  
  describe('hashPassword', () => {
    it('should hash password successfully', () => {
      const hashedPassword = hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(typeof hashedPassword).toBe('string');
    });
    
    it('should generate different hashes for same password', () => {
      const hash1 = hashPassword(plainPassword);
      const hash2 = hashPassword(plainPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for correct password', () => {
      const hashedPassword = hashPassword(plainPassword);
      const isValid = comparePassword(plainPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });
    
    it('should return false for incorrect password', () => {
      const hashedPassword = hashPassword(plainPassword);
      const isValid = comparePassword('wrongpassword', hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });
});