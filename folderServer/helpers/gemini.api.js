require("dotenv").config();

const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateContent(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-05-20",
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
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    // 503 Service Unavailable
    if (error.response && error.response.status === 503) {
      throw new Error("Service Unavailable: Please try again later.");
    }
    throw error;
  }
}

module.exports = {
  generateContent,
};