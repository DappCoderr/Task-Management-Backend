import { User } from "../models/User.js";
import { Op, Sequelize } from "sequelize";

const userRepository = {
  createUser: async (data) => {
    return User.create(data);
  },

  countUsers: async () => {
    return User.count();
  },

  findUserById: async (id) => {
    return User.findByPk(id);
  },

  findUserByEmail: async (email) => {
    return User.scope("auth").findOne({ where: { email } });
  },

  findUserByUsername: async (username) => {
    return User.findOne({ where: { username } });
  },

  // findAllUsers: async (options = {}) => {
  //   return User.findAll({
  //     attributes: { exclude: ["password", "refreshToken"] },
  //     ...options,
  //   });
  // },

  findAllUsers: async (options = {}) => {
    const { where, limit, offset, order, attributes } = options;
    const queryOptions = {
      attributes: attributes || { exclude: ["password", "refreshToken"] },
      ...options,
    };
    if (where) {
      queryOptions.where = where;
    }
    if (limit) queryOptions.limit = parseInt(limit);
    if (offset) queryOptions.offset = parseInt(offset);
    if (order) {
      queryOptions.order = order;
    } else {
      queryOptions.order = [["createdAt", "DESC"]];
    }
    return User.findAll(queryOptions);
  },

  findRecentUsers: async (limit = 5) => {
    return User.findAll({
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["password", "refreshToken"] },
    });
  },

  searchUsers: async (searchTerm, options = {}) => {
    const where = {
      [Op.or]: [
        { username: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    };

    return User.findAll({
      where,
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
