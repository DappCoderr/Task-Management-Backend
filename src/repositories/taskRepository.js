import { Task } from "../models/Task.js";

const taskRepository = {
  createTask: async (data) => {
    return Task.create(data);
  },

  findTaskById: async (id) => {
    return Task.findByPk(id);
  },

  findTaskByIdAndUser: async (id, userId) => {
    return Task.findOne({ where: { id, userId } });
  },

  findTasksByUser: async (userId, filters = {}) => {
    const where = { userId, ...filters };
    return Task.findAll({ where });
  },

  updateTask: async (id, data) => {
    const task = await Task.findByPk(id);
    if (!task) return null;
    return task.update(data);
  },

  deleteTask: async (id) => {
    const task = await Task.findByPk(id);
    if (!task) return null;
    await task.destroy();
    return true;
  },
};

export default taskRepository;
