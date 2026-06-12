import userRepository from "../repositories/userRepository.js";
import ValidationError from "../utils/errors/validationError.js";
import { Sequelize } from "sequelize";

export const register = async (data) => {
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
