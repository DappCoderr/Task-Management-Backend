import userRepository from "../repositories/userRepository.js";
import ValidationError from "../utils/errors/validationError.js";
import { Sequelize } from "sequelize";
import ClientError from "../utils/errors/clientError.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";
import * as token from "../utils/jwt.js";

export const registerService = async (data) => {
  try {
    const newUser = await userRepository.createUser(data);
    return newUser;
  } catch (error) {
    console.error("User register service error:", error);
    if (error.name === "SequelizeValidationError") {
      throw new ValidationError({ error: error.errors }, error.message);
    }
    if (error instanceof Sequelize.UniqueConstraintError) {
      throw new ValidationError(
        {
          error: ["A user with same email or username already exists"],
        },
        "A user with same email or username already exists",
      );
    }
  }
};

export const loginService = async (data) => {
  try {
    const user = await userRepository.findUserByEmail(data.email);
    console.log("user data:---", data);
    console.log("User password", user.password);

    if (!user) {
      throw new ClientError({
        explanation: "Invalid data sent from the user",
        message: "No Registered user found with this email",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new ClientError({
        explanation: "Invalid data sent from the user",
        message: "Invalid password, please try again",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = token.signAccessToken(payload);
    const refreshToken = token.signRefreshToken(payload);
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: hashedRefresh });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("User login service error:", error);
    throw error;
  }
};

export const refreshService = async (incomingRefreshToken) => {
  try {
    if (!incomingRefreshToken) {
      throw new ClientError({
        message: "Refresh token missing",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    let decoded = token.verifyRefreshToken(incomingRefreshToken);
    if (!decoded) {
      throw new ClientError({
        message: "Invalid refresh token",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
    const userRecord = await userRepository.findUserById(decoded.sub);
    console.log("---refreshService------: ", userRecord);

    if (!userRecord) {
      throw new ClientError({
        explanation: "Invalid RefreshToken sent from the user",
        message: "No Registered user found with this id",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    const user = await userRepository.findUserByEmail(userRecord.email);
    if (!user || !user.refreshToken) {
      throw new ClientError({
        message: "Invalid session",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const isValid = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshToken,
    );
    if (!isValid) {
      throw new ClientError({
        message: "Invalid session",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const payload = { sub: user.id, role: user.role };
    const newAccessToken = token.signAccessToken(payload);
    const newRefreshToken = token.signRefreshToken(payload);

    const newHashed = await bcrypt.hashSync(newRefreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: newHashed });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("User refresh service error:", error);
    throw error;
  }
};

export const logoutService = async (refreshTokenFromCookie) => {
  try {
    console.log("----refresh token-----", refreshTokenFromCookie);
    if (!refreshTokenFromCookie) {
      throw new ClientError({
        message: "User is already logged out",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
    let decoded = token.verifyRefreshToken(refreshTokenFromCookie);
    if (!decoded) {
      throw new ClientError({
        message: "Invalid session",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
    await userRepository.updateUser(decoded.sub, {
      refreshToken: null,
    });

    return { message: "Logged out" };
  } catch (error) {
    console.log("User logout service error", error);
    throw error;
  }
};

export const getProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) throw new Error("User not found");
  const { password, refreshToken, ...profile } = user.toJSON();
  return profile;
};

export const updateProfile = async (userId, data) => {
  delete data.role;
  delete data.id;
  const user = await userRepository.updateUser(userId, data);
  if (!user) throw new Error("User not found");
  return user;
};

export const deleteAccount = async (userId) => {
  const success = await userRepository.deleteUser(userId);
  if (!success) throw new Error("User not found");
  return { message: "Account deleted" };
};

export const getAllUsers = async (pagination = {}) => {
  const { limit = 20, offset = 0 } = pagination;
  return userRepository.findAllUsers({ limit, offset });
};

export const deleteAnyUser = async (adminUserId, targetUserId) => {
  if (adminUserId === targetUserId) {
    throw new Error("You cannot delete your own account via this endpoint");
  }
  const user = await userRepository.findUserById(targetUserId);
  if (!user) throw new Error("User not found");
  await userRepository.deleteUser(targetUserId);
  return { message: "User deleted successfully" };
};
