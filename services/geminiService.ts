
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const startChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-pro',
    config: {
      thinkingConfig: {
        thinkingBudget: 32768,
      },
    },
  });
  return chat;
};
