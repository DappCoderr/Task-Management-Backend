import { User } from "../models/User.js";

const userRepository = {
  createUser: async (data) => {
    return User.create(data);
  },

  findUserById: async (id) => {
    return User.findByPk(id);
  },

  countUsers: async() =>{
    return User.count();
  },

  findUserByEmail: async (email) => {
    return User.scope("auth").findOne({ where: { email } });
  },

  findAllUsers: async (options = {}) => {
    return User.findAll({
      attributes: { exclude: ["password", "refreshToken"] },
      ...options,
    });
  },

  updateUser: async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update(data);
  },

  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return true;
  },
};

export default userRepository;
