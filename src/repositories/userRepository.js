import { User } from "../models/User";

const userRepository = {
  createUser: async (data) => {
    return User.create(data);
  },

  findUserById: async (id) => {
    return User.findByPk(id);
  },

  findUserByEmail: async (email) => {
    return User.findOne({ where: { email } });
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
