const { generateContent } = require('../../helpers/gemini.api');
const { GoogleGenAI } = require('@google/genai');

jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: {
      ARRAY: 'array',
      OBJECT: 'object',
      STRING: 'string',
      INTEGER: 'integer'
    }
  };
});

describe('Gemini API Helper', () => {
  let mockGenerateContent;
  
  beforeEach(() => {
    // Get the mock function from the mocked GoogleGenAI
    const MockedGoogleGenAI = require('@google/genai').GoogleGenAI;
    const mockInstance = new MockedGoogleGenAI();
    mockGenerateContent = mockInstance.models.generateContent;
    jest.clearAllMocks();
  });
  
  it('should generate exercises successfully', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify([
        {
          name: 'Push-ups',
          steps: '1. Start in plank position\n2. Lower body\n3. Push back up',
          sets: 3,
          repetitions: 15,
          youtubeUrl: 'https://youtube.com/test'
        }
      ]))
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent('test prompt');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('name', 'Push-ups');
    expect(result[0]).toHaveProperty('steps');
    expect(result[0]).toHaveProperty('sets', 3);
    expect(result[0]).toHaveProperty('repetitions', 15);
    expect(result[0]).toHaveProperty('youtubeUrl');
  });

  it('should handle valid JSON response with text as string', async () => {
    const mockResponse = {
      text: JSON.stringify([
        {
          name: 'Squats',
          steps: '1. Stand with feet apart\n2. Lower down\n3. Stand back up',
          sets: 4,
          repetitions: 12,
          youtubeUrl: 'https://youtube.com/squats'
        }
      ])
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent('test prompt');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('name', 'Squats');
    expect(result[0]).toHaveProperty('sets', 4);
  });

  it('should handle response with candidates structure', async () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify([
              {
                name: 'Lunges',
                steps: '1. Step forward\n2. Lower body\n3. Return to start',
                sets: 3,
                repetitions: 10,
                youtubeUrl: 'https://youtube.com/lunges'
              }
            ])
          }]
        }
      }]
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent('test prompt');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('name', 'Lunges');
  });

  it('should return valid exercise data structure', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify([
        {
          name: 'Burpees',
          steps: '1. Squat down\n2. Jump back\n3. Push up\n4. Jump forward\n5. Jump up',
          sets: 2,
          repetitions: 8,
          youtubeUrl: 'https://youtube.com/burpees'
        }
      ]))
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent('Generate burpee exercise');
    
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toEqual({
      name: 'Burpees',
      steps: '1. Squat down\n2. Jump back\n3. Push up\n4. Jump forward\n5. Jump up',
      sets: 2,
      repetitions: 8,
      youtubeUrl: 'https://youtube.com/burpees'
    });
  });

  it('should handle multiple exercises in response', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify([
        {
          name: 'Push-ups',
          steps: 'Push up exercise',
          sets: 3,
          repetitions: 15,
          youtubeUrl: 'https://youtube.com/pushups'
        },
        {
          name: 'Sit-ups',
          steps: 'Sit up exercise',
          sets: 3,
          repetitions: 20,
          youtubeUrl: 'https://youtube.com/situps'
        }
      ]))
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    const result = await generateContent('Generate multiple exercises');
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Push-ups');
    expect(result[1].name).toBe('Sit-ups');
  });

  it('should handle JSON parse error', async () => {
    const mockResponse = {
      text: jest.fn().mockResolvedValue('invalid json string')
    };
    
    mockGenerateContent.mockResolvedValue(mockResponse);
    
    await expect(generateContent('test prompt')).rejects.toThrow();
  });

  it('should handle 503 Service Unavailable error', async () => {
    const error503 = new Error('Service error');
    error503.response = { status: 503 };
    
    mockGenerateContent.mockRejectedValue(error503);
    
    await expect(generateContent('test prompt')).rejects.toThrow('Service Unavailable: Please try again later.');
  });

  it('should handle general API errors', async () => {
    const generalError = new Error('General API error');
    
    mockGenerateContent.mockRejectedValue(generalError);
    
    await expect(generateContent('test prompt')).rejects.toThrow('General API error');
  });
});