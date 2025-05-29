const { generateContent } = require('../../helpers/gemini.api');
const { GoogleGenAI } = require('@google/genai');

// Mock Google GenAI
jest.mock('@google/genai');

describe('Gemini API Helper', () => {
  let mockGenerateContent;
  
  beforeEach(() => {
    mockGenerateContent = jest.fn();
    GoogleGenAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should generate exercises successfully', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify([
          {
            name: 'Push-ups',
            description: 'Classic bodyweight exercise',
            steps: '1. Start in plank position\n2. Lower body\n3. Push back up',
            reps: '3 sets of 10-15 reps'
          }
        ])
      }
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent(['Dumbbells'], 'Chest');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('name', 'Push-ups');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('steps');
    expect(result[0]).toHaveProperty('reps');
  });
  
  it('should handle API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Error'));
    
    await expect(generateContent(['Dumbbells'], 'Chest'))
      .rejects.toThrow('API Error');
  });
  
  it('should handle invalid JSON response', async () => {
    const mockResponse = {
      response: {
        text: () => 'Invalid JSON'
      }
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    await expect(generateContent(['Dumbbells'], 'Chest'))
      .rejects.toThrow();
  });

  it('should handle 503 service unavailable error', async () => {
    const error503 = new Error('Service Unavailable');
    error503.response = {
      status: 503
    };
    
    mockGenerateContent.mockRejectedValue(error503);
    
    await expect(generateContent(['Dumbbells'], 'Chest'))
      .rejects.toThrow('Service Unavailable: Please try again later.');
  });
});