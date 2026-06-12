import { register } from "../service/userService.js";
import userRepository from "../repositories/userRepository.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/cookieOptions.js";
import bcrypt from "bcrypt";
import StatusCodes from "http-status-codes";
import {
  internalErrorResponse,
  successResponse,
  customErrorResponse,
} from "../utils/common/responseObject.js";

export const registerAuth = async (req, res, next) => {
  try {
    const user = await register(req.body);
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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userRepository.findUserByEmail(email);
    console.log("user data:---", user);
    console.log("User password", user.password);
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });

    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: hashedRefresh });

    res.cookie("accessToken", accessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Refresh token missing" });

    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid refresh token" });
    }

    const user = await userRepository.findUserById(decoded.sub);
    if (!user || !user.refreshToken)
      return res.status(401).json({ message: "Invalid session" });

    const isValid = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshToken,
    );
    if (!isValid)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid session" });

    const newPayload = { sub: user.id, role: user.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const newHashed = await bcrypt.hash(newRefreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: newHashed });

    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await userRepository.updateUser(decoded.sub, { refreshToken: null });
      } catch {}
    }
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/v1/auth/refresh" });
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};
