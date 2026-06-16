export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  maxAge: 15 * 60 * 1000,
  path: "/",
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};
