import { projectService } from '../services/projectService.js';

export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getProjects();
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};
