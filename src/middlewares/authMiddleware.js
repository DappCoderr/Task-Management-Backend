import { verifyAccessToken } from "../utils/jwt.js";
import StatusCodes from "http-status-codes";

export const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Access token missing" });
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired access token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied. This action requires ADMIN role. Your current role is: USER" });
    }
    next();
  };
};
