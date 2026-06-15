import { StatusCodes } from "http-status-codes";
import * as adminService from "../service/adminService.js";
import {
  successResponse,
  customErrorResponse,
  internalErrorResponse,
} from "../utils/common/responseObject.js";

export const getAdminDashboardController = async (req, res) => {
  try {
    const dashboard = await adminService.getAdminDashboard();
    return res
      .status(StatusCodes.OK)
      .json(successResponse(dashboard, "Dashboard data fetched successfully"));
  } catch (error) {
    console.log("Get admin dashboard controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const getAllUsersController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "DESC";

    if (limit < 1 || limit > 100) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        err: { limit: "Limit must be between 1 and 100" },
        data: {},
        message: "Invalid pagination parameters",
      });
    }

    if (offset < 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        err: { offset: "Offset must be a positive number" },
        data: {},
        message: "Invalid pagination parameters",
      });
    }

    const result = await adminService.getAllUsers({
      limit,
      offset,
      search,
      sortBy,
      sortOrder,
    });

    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "Users fetched successfully"));
  } catch (error) {
    console.log("Get all users controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const getUserProfileController = async (req, res) => {
  try {
    const userProfile = await adminService.getUserProfile(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(userProfile, "User profile fetched successfully"));
  } catch (error) {
    console.log("Get user profile controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const getUserTasksController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;
    const priority = req.query.priority;

    const result = await adminService.getUserTasks(req.params.id, {
      limit,
      offset,
      status,
      priority,
    });

    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "User tasks fetched successfully"));
  } catch (error) {
    console.log("Get user tasks controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const result = await adminService.deleteUser(req.params.id, req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "User deleted successfully"));
  } catch (error) {
    console.log("Delete user controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
