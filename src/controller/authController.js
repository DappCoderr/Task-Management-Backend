import bcrypt from "bcrypt";
import StatusCodes from "http-status-codes";
import userRepository from "../repositories/userRepository.js";
import {
  registerService,
  loginService,
  refreshService,
  logoutService,
} from "../service/userService.js";
import * as token from "../utils/jwt.js";
import * as cookieToken from "../utils/cookieOptions.js";
import {
  successResponse,
  customErrorResponse,
  internalErrorResponse,
} from "../utils/common/responseObject.js";

export const registerController = async (req, res) => {
  try {
    const user = await registerService(req.body);
    res
      .status(StatusCodes.CREATED)
      .json(successResponse(user, "User created successfully"));
  } catch (error) {
    console.log("User registerAuth controller error", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const loginController = async (req, res) => {
  try {
    const result = await loginService(req.body);
    res.cookie(
      "accessToken",
      result.accessToken,
      cookieToken.accessTokenCookieOptions,
    );
    res.cookie(
      "refreshToken",
      result.refreshToken,
      cookieToken.refreshTokenCookieOptions,
    );
    return res
      .status(StatusCodes.OK)
      .json(successResponse(result.user, "User logged in successfully"));
  } catch (error) {
    console.log("Auth controller error", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const refreshController = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    const tokens = await refreshService(incomingRefreshToken);

    res.cookie(
      "accessToken",
      tokens.accessToken,
      cookieToken.accessTokenCookieOptions,
    );
    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      cookieToken.refreshTokenCookieOptions,
    );

    return res
      .status(StatusCodes.OK)
      .json(successResponse({}, "Tokens refreshed successfully"));
  } catch (error) {
    console.log("Refresh controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};

export const logoutController = async (req, res) => {
  try {
    console.log("cookies:", req.cookies);
    console.log("headers cookie:", req.headers.cookie);
    const refreshToken = req.cookies?.refreshToken;
    await logoutService(refreshToken);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res
      .status(StatusCodes.OK)
      .json(successResponse({}, "Logged out successfully"));
  } catch (error) {
    console.log("Logout controller error:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json(customErrorResponse(error));
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(internalErrorResponse(error));
  }
};
