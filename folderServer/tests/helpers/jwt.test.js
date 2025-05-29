const { generateToken, verifyToken } = require('../../helpers/jwt');

describe('JWT Helper', () => {
  const payload = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser'
  };
  
  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    
    it('should throw error if payload is undefined', () => {
      expect(() => generateToken(undefined)).toThrow();
    });
  });
  
  describe('verifyToken', () => {
    it('should verify valid token successfully', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.username).toBe(payload.username);
    });
    
    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });
    
    it('should throw error on bad token', async () => {
      await expect(() => verifyToken('bad.token')).toThrow();
    });
  });
});