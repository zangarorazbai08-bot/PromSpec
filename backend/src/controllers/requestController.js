import { requestService } from '../services/requestService.js';

export const getRequests = async (req, res, next) => {
  try {
    const filters = { ...req.query };
    if (req.user.role === 'foreman') filters.foreman_id = req.user.id;
    const requests = await requestService.getRequests(filters);
    res.json({ requests });
  } catch (error) { next(error); }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getById(req.params.id);
    res.json({ request });
  } catch (error) { next(error); }
};

export const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createRequest(req.body, req.user.id);
    res.status(201).json({ request });
  } catch (error) { next(error); }
};

// Storekeeper issues materials from warehouse
export const issueRequest = async (req, res, next) => {
  try {
    const request = await requestService.issueRequest(req.params.id, req.user.id);
    res.json({ request });
  } catch (error) { next(error); }
};

// Foreman confirms receipt
export const confirmReceipt = async (req, res, next) => {
  try {
    const request = await requestService.confirmReceipt(req.params.id, req.user.id);
    res.json({ request });
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await requestService.updateStatus(req.params.id, status, req.user.id);
    res.json({ request });
  } catch (error) { next(error); }
};
