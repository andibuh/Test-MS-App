import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateExerciseDescription = async (title: string, category: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) return "AI description unavailable (Missing API Key)";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, engaging, 2-sentence description for a fitness exercise titled "${title}" in the category "${category}".`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};

export const suggestVariants = async (stepDescription: string): Promise<string> => {
  try {
     if (!process.env.API_KEY) return "";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Given the exercise step: "${stepDescription}", suggest one "easier" variant and one "harder" variant. Return ONLY valid JSON in this format: {"easier": "text", "harder": "text"}. Do not use Markdown blocks.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};