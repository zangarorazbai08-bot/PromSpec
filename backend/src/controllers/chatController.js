import * as chatService from '../services/chatService.js';

export const listConversations = async (req, res) => {
  const conversations = await chatService.listConversations(req.user.id, req.user.role);
  res.json({ conversations });
};

export const listMessages = async (req, res) => {
  const result = await chatService.listMessages(req.user.id, req.user.role, Number(req.params.bookingId));
  res.json(result);
};

export const sendMessage = async (req, res) => {
  const message = await chatService.sendMessage(req.user.id, req.user.role, Number(req.params.bookingId), req.body.message);
  res.status(201).json({ message });
};
