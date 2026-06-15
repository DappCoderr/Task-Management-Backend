import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { Op, Sequelize } from "sequelize";

const taskRepository = {
  createTask: async (data) => {
    return Task.create(data);
  },

  findTaskById: async (id) => {
    return Task.findByPk(id);
  },

  countTasks: async () => {
    return Task.count();
  },

  findTasksByUserId: async (userId, filters = {}) => {
    const { limit, offset, status, priority, ...otherFilters } = filters;
    const where = { userId, ...otherFilters };
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    const queryOptions = {
      where,
      order: [["createdAt", "DESC"]],
    };
    if (limit) queryOptions.limit = parseInt(limit);
    if (offset) queryOptions.offset = parseInt(offset);
    return Task.findAll(queryOptions);
  },

  countUserTasks: async (userId, filters = {}) => {
    const where = { userId, ...filters };
    return Task.count({ where });
  },

  deleteAllUserTasks: async (userId) => {
    const result = await Task.destroy({
      where: { userId },
    });
    return result;
  },

  getTasksByStatus: async () => {
    const tasksByStatus = await Task.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });
    const formattedResult = {
      TODO: 0,
      "IN PROGRESS": 0,
      COMPLETED: 0,
    };

    tasksByStatus.forEach((item) => {
      formattedResult[item.status] = parseInt(item.count);
    });

    return formattedResult;
  },

  getUserTaskStats: async (userId) => {
    const tasksByStatus = await Task.findAll({
      where: { userId },
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const totalTasks = await Task.count({ where: { userId } });
    const completedTasks = await Task.count({
      where: { userId, status: "COMPLETED" },
    });

    const byStatus = {
      TODO: 0,
      "IN PROGRESS": 0,
      COMPLETED: 0,
    };

    tasksByStatus.forEach((item) => {
      byStatus[item.status] = parseInt(item.count);
    });

    const completionRate =
      totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    return {
      total: totalTasks,
      completed: completedTasks,
      completionRate: parseFloat(completionRate),
      byStatus,
    };
  },

  findRecentTasks: async (limit = 5) => {
    return Task.findAll({
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });
  },

  getAllTasks: async (filters = {}) => {
    const { limit, offset, status, priority, userId } = filters;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (userId) where.userId = userId;

    const queryOptions = {
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    };

    if (limit) queryOptions.limit = parseInt(limit);
    if (offset) queryOptions.offset = parseInt(offset);

    return Task.findAll(queryOptions);
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
