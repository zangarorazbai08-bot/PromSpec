import env from '../config/env.js';
import { getGeminiClient } from '../config/gemini.js';
import { createError } from '../utils/httpError.js';
import { cleanString } from '../utils/validators.js';

const systemInstruction = `
You are StayNest AI assistant for a housing rental and booking portal.
You help users with short, practical answers about:
- how to search and book homes
- what to check before booking
- how to publish a home for rent
- hosting tips, pricing basics, guest communication, and listing quality
- cancellation, safety, booking etiquette, and platform usage

Rules:
- Answer in the same language as the user's message when possible.
- Be concise, clear, and helpful.
- If a request is outside rental or booking topics, gently steer back to housing rental, hosting, booking, guest communication, or property listing questions.
- Do not invent platform policies that were not provided.
- Do not claim a booking is confirmed or cancelled unless the user says so.
- For legal, tax, or emergency matters, clearly say the user should verify with a qualified local professional or official source.
`.trim();

const toGeminiRole = (role) => (role === 'assistant' || role === 'model' ? 'model' : 'user');

const normalizeMessages = (messages) => {
  if (!Array.isArray(messages)) {
    throw createError(400, 'Messages тізімі қажет');
  }

  const normalized = messages
    .map((message) => ({
      role: toGeminiRole(message?.role),
      text: cleanString(message?.text)
    }))
    .filter((message) => message.text)
    .slice(-12);

  if (!normalized.length) {
    throw createError(400, 'Кемінде бір хабарлама жіберіңіз');
  }

  return normalized;
};

export const generateAssistantReply = async (messages) => {
  const client = getGeminiClient();

  if (!client) {
    throw createError(503, 'Gemini API key орнатылмаған');
  }

  const normalizedMessages = normalizeMessages(messages);
  const response = await client.models.generateContent({
    model: env.geminiModel,
    contents: normalizedMessages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }]
    })),
    config: {
      systemInstruction,
      maxOutputTokens: 700,
      temperature: 0.7,
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  });

  const text = cleanString(response.text);

  if (!text) {
    throw createError(502, 'Gemini бос жауап қайтарды');
  }

  return {
    model: env.geminiModel,
    text
  };
};
