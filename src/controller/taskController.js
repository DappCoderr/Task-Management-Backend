import { StatusCodes } from "http-status-codes";
import * as service from "../service/taskService.js";
import {
  successResponse,
  customErrorResponse,
  internalErrorResponse,
} from "../utils/common/responseObject.js";

export const createTaskController = async (req, res) => {
  try {
    const task = await service.createTaskForUser({
      ...req.body,
      userId: req.user.id,
    });
    return res
      .status(StatusCodes.CREATED)
      .json(successResponse(task, "Task created"));
  } catch (error) {
    console.log("Create task controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const getTasksController = async (req, res) => {
  try {
    const tasks = await service.getUserTasks(req.user.id, req.query.status);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(tasks, "Tasks retrieved"));
  } catch (error) {
    console.log("Get tasks controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const updateTaskStatusController = async (req, res) => {
  try {
    const task = await service.updateTaskStatus(
      req.params.id,
      req.body.status,
      req.user.id,
    );
    return res
      .status(StatusCodes.OK)
      .json(successResponse(task, "Task status updated"));
  } catch (error) {
    console.log("Update task status controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const deleteTaskController = async (req, res) => {
  try {
    const result = await service.deleteUserTask(req.params.id, req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "Task deleted"));
  } catch (error) {
    console.log("Delete task controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
