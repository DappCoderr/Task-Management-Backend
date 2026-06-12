import { sequelize } from "../config/database.js";
import { DataTypes } from "sequelize";

export const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("TODO", "IN PROGRESS", "COMPLETED"),
      defaultValue: "TODO",
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      defaultValue: "LOW",
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  },
);
