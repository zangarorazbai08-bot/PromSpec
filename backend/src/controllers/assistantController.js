import * as assistantService from '../services/assistantService.js';

export const chat = async (req, res) => {
  const reply = await assistantService.generateAssistantReply(req.body.messages);
  res.json({ reply });
};
