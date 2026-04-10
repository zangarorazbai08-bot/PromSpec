import { GoogleGenAI } from '@google/genai';
import env from './env.js';

let geminiClient = null;

export const getGeminiClient = () => {
  if (!env.geminiApiKey) {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: env.geminiApiKey
    });
  }

  return geminiClient;
};
