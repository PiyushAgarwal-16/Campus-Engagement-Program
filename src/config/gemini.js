// Gemini AI configuration
// Replace with your actual Gemini API key when ready
export const GEMINI_API_KEY = "your-gemini-api-key-here";

export const geminiConfig = {
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  },
};
