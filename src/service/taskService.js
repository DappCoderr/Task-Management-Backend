import taskRepository from "../repositories/taskRepository.js";
import ValidationError from "../utils/errors/validationError.js";
import NotFoundError from "../utils/errors/notFoundError.js";
import ForbiddenError from "../utils/errors/forbiddenError.js";

export const createTaskForUser = async ({
  title,
  description,
  dueDate,
  priority,
  userId,
}) => {
  try {
    if (!title || !description) {
      throw new ValidationError({
        fields: { input: "Title and description are required" },
        message: "Title and description are required",
      });
    }
    return taskRepository.createTask({
      title,
      description,
      dueDate,
      priority,
      userId,
    });
  } catch (error) {
    console.error("Taskservice create error:", error);
    throw error;
  }
};

export const getUserTasks = async (userId, statusFilter) => {
  try {
    const filters = statusFilter ? { status: statusFilter } : {};
    return taskRepository.findTasksByUser(userId, filters);
  } catch (error) {
    console.error("Taskservice get task error:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, newStatus, userId) => {
  try {
    const validStatuses = ["TODO", "IN PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError({
        fields: {
          status: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        message: "Invalid task status",
      });
    }

    const task = await taskRepository.findTaskById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    if (task.userId !== userId)
      throw new ForbiddenError("You can only update your own tasks");

    return taskRepository.updateTask(taskId, { status: newStatus });
  } catch (error) {
    console.error("Taskservice get task error:", error);
    throw error;
  }
};

export const deleteUserTask = async (taskId, userId) => {
  try {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    if (task.userId !== userId)
      throw new ForbiddenError("You can only delete your own tasks");

    await taskRepository.deleteTask(taskId);
    return { message: "Task deleted" };
  } catch (error) {
    console.error("Taskservice get task error:", error);
    throw error;
  }
};
