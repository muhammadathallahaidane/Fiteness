require('dotenv').config();
const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateContent(prompt, context) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              steps: { type: Type.STRING },
              sets: { type: Type.INTEGER },
              repetitions: { type: Type.INTEGER },
              youtubeUrl: { type: Type.STRING }
            },
            required: ["name", "steps", "sets", "repetitions", "youtubeUrl"]
          }
        },
      },
    });
    
    console.log("Raw Gemini Response:", response);
    
    // Ekstrak text dengan benar
    let raw;
    if (typeof response.text === 'function') {
      raw = await response.text();
    } else if (typeof response.text === 'string') {
      raw = response.text;
    } else {
      // Fallback untuk struktur response yang berbeda
      raw = response.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(response);
    }
    
    console.log("Extracted text:", raw);
    
    // Parse JSON
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error("Error generating content:", error);
    if (error.response && error.response.status === 503) {
      throw new Error("Service Unavailable: Please try again later.");
    }
    throw error;
  }
}

module.exports = {
  generateContent
};