import Project from "../models/project.model.js";

// CREATE PROJECT
export const createProject = async (data) => {
  return await Project.create(data);
};

// GET ALL PROJECTS
export const getAllProjects = async () => {
  return await Project.findAll({
    order: [["createdAt", "DESC"]],
  });
};

// GET SINGLE PROJECT
export const getProjectById = async (id) => {
  const project = await Project.findByPk(id);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

// UPDATE PROJECT
export const updateProject = async (id, data) => {
  const project = await Project.findByPk(id);

  if (!project) {
    throw new Error("Project not found");
  }

  await project.update(data);
  return project;
};

// DELETE PROJECT
export const deleteProject = async (id) => {
  const project = await Project.findByPk(id);

  if (!project) {
    throw new Error("Project not found");
  }

  await project.destroy();

  return { message: "Project deleted successfully" };
};