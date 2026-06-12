import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import bcrypt from "bcrypt";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: { msg: "Username already exists" },
      validate: {
        notEmpty: { msg: "Username is required" },
        len: {
          args: [3, 30],
          msg: "Username must be between 3 and 30 characters",
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: "Username can only contain letters, numbers and underscore",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: { msg: "Email already exists" },
      validate: {
        notEmpty: { msg: "Email is required" },
        isEmail: { msg: "Please enter a valid email address" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is required",
        },
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters",
        },
      },
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      defaultValue: "USER",
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["refreshToken", "password"] },
    },
    scopes: {
      auth: { attributes: { include: ["password", "refreshToken"] } },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);
