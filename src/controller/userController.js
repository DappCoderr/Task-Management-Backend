import { StatusCodes } from "http-status-codes";
import * as userService from "../service/userService.js";
import {
  successResponse,
  customErrorResponse,
  internalErrorResponse,
} from "../utils/common/responseObject.js";

export const getProfileController = async (req, res) => {
  try {
    const user = await userService.getProfileService(req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(user, "User Profile"));
  } catch (error) {
    console.log("Get profile controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const response = await userService.updateProfile(req.user.id, req.body);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(response, "Profile updated"));
  } catch (error) {
    console.log("Update profile controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const deleteAccountController = async (req, res) => {
  try {
    const result = await userService.deleteAccount(req.user.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "Account deleted"));
  } catch (error) {
    console.log("Delete account controller error:", error);
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
    // Optional: validate that limit/offset are positive numbers
    const users = await userService.getAllUsers({ limit, offset });
    return res
      .status(StatusCodes.OK)
      .json(successResponse(users, "Users fetched"));
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

export const deleteAnyUserController = async (req, res) => {
  try {
    const result = await userService.deleteAnyUser(req.user.id, req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(successResponse(result, "User deleted"));
  } catch (error) {
    console.log("Delete any user controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
