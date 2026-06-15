import taskRepository from "../repositories/taskRepository.js";
import NotFoundError from "../utils/errors/notFoundError.js";
import ForbiddenError from "../utils/errors/forbiddenError.js";

export const createTaskService = async ({
  title,
  description,
  dueDate,
  priority,
  userId,
}) => {
  try {
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

export const getAllTasksService = async (userId, statusFilter) => {
  try {
    const filters = statusFilter ? { status: statusFilter } : {};
    return taskRepository.findTasksByUserId(userId, filters);
  } catch (error) {
    console.error("Taskservice get task error:", error);
    throw error;
  }
};

export const getSingleTaskService = async (taskId, userId) => {
  try {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    if (task.userId !== userId) {
      throw new ForbiddenError("You can only view your own tasks");
    }
    return task;
  } catch (error) {
    console.error("Task service get single task error:", error);
    throw error;
  }
};

export const updateTaskService = async (taskId, updateData, userId) => {
  try {
    const existingTask = await taskRepository.findTaskById(taskId);

    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError("You can only update your own tasks");
    }

    const updatedTask = await taskRepository.updateTask(taskId, updateData);
    return updatedTask;
  } catch (error) {
    console.error("Task service update task error:", error);
    throw error;
  }
};

// export const updateTaskStatus = async (taskId, newStatus, userId) => {
//   try {
//     const validStatuses = ["TODO", "IN PROGRESS", "COMPLETED"];
//     if (!validStatuses.includes(newStatus)) {
//       throw new ValidationError({
//         fields: {
//           status: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
//         },
//         message: "Invalid task status",
//       });
//     }

//     const task = await taskRepository.findTaskById(taskId);
//     if (!task) throw new NotFoundError("Task not found");
//     if (task.userId !== userId)
//       throw new ForbiddenError("You can only update your own tasks");

//     return taskRepository.updateTask(taskId, { status: newStatus });
//   } catch (error) {
//     console.error("Taskservice get task error:", error);
//     throw error;
//   }
// };

export const deleteTaskService = async (taskId, userId) => {
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
