import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: In a real production build, ensure the API key is properly restricted or proxied.
const ai = new GoogleGenAI({ apiKey: import.meta.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are "LuxeBot", a sophisticated and helpful real estate assistant for LuxeEstate, a premium real estate agency. 
Your tone should be professional, polite, and knowledgeable about luxury properties.
You can help users by:
1. Answering questions about buying or selling homes.
2. Explaining mortgage concepts simply.
3. Describing the lifestyle in popular cities like New York, Los Angeles, and Miami.
4. If a user expresses interest in a specific property or viewing, kindly ask them to provide their contact details or use the "Contact" form on the website.
Keep responses concise (under 100 words) and formatting clean.`;

// Fix: Update history type to accept an array of parts instead of a tuple
export const sendMessageToGemini = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[] = []) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I apologize, but I am currently experiencing high traffic. Please try again later or contact our support team directly.";
  }
};