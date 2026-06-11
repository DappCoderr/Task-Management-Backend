import { Task } from "./Task";
import { User } from "./user";

User.hasMany(Task, { foreignKey: "userId" });
Task.belongsTo(User, { foreignKey: "userId" });
