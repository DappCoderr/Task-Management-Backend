import userRepository from "../repositories/userRepository.js";
import taskRepository from "../repositories/taskRepository.js";
import ValidationError from "../utils/errors/validationError.js";
import NotFoundError from "../utils/errors/notFoundError.js";
import ForbiddenError from "../utils/errors/forbiddenError.js";
import { Op } from "sequelize";

export const getAdminDashboard = async () => {
  try {
    const totalUsers = await userRepository.countUsers();
    const totalTasks = await taskRepository.countTasks();
    const allUser = await userRepository.findAllUsers()
    // const tasksByStatus = await taskRepository.getTasksByStatus();
    // const recentUsers = await userRepository.findRecentUsers(5);
    // const recentTasks = await taskRepository.findRecentTasks(5);

    return {
      statistics: {
        totalUsers,
        totalTasks,
      },
      allUser
    };
  } catch (error) {
    console.error("Admin service get dashboard error:", error);
    throw error;
  }
};

export const getAllUsers = async ({
  limit,
  offset,
  search,
  sortBy,
  sortOrder,
}) => {
  try {
    const where = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const allowedSortFields = ["username", "email", "createdAt", "updatedAt"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const users = await userRepository.findAllUsers({
      where,
      limit,
      offset,
      order: [[sortField, order]],
      attributes: { exclude: ["password"] },
    });

    const totalCount = await userRepository.countUsers(where);

    return {
      users,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  } catch (error) {
    console.error("Admin service get all users error:", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const user = await userRepository.findUserById(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const taskStats = await taskRepository.getUserTaskStats(userId);

    return {
      user,
      taskStatistics: taskStats,
    };
  } catch (error) {
    console.error("Admin service get user profile error:", error);
    throw error;
  }
};

export const getUserTasks = async (
  userId,
  { limit, offset, status, priority },
) => {
  try {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (priority) {
      filters.priority = priority;
    }

    const tasks = await taskRepository.findTasksByUserId(userId, {
      ...filters,
      limit,
      offset,
    });

    const totalCount = await taskRepository.countUserTasks(userId, filters);

    return {
      tasks,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  } catch (error) {
    console.error("Admin service get user tasks error:", error);
    throw error;
  }
};

export const deleteUser = async (userIdToDelete, adminId) => {
  try {
    if (userIdToDelete === adminId) {
      throw new ForbiddenError("You cannot delete your own admin account");
    }

    const user = await userRepository.findUserById(userIdToDelete);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role === "ADMIN") {
      throw new ForbiddenError("Cannot delete another admin account");
    }

    await taskRepository.deleteAllUserTasks(userIdToDelete);
    const result = await userRepository.deleteUser(userIdToDelete);

    return {
      message: "User and all associated data deleted successfully",
      deletedUserId: userIdToDelete,
    };
  } catch (error) {
    console.error("Admin service delete user error:", error);
    throw error;
  }
};
