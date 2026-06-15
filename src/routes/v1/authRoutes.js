import { Router } from "express";
import * as authController from "../../controller/authController.js";
import { validate } from "../../validation/zodValidator.js";
import * as validation from "../../validation/userModel.js";

const router = Router();

router.post(
  "/register",
  validate(validation.registerValidation),
  authController.registerController,
);
router.post(
  "/login",
  validate(validation.loginValidation),
  authController.loginController,
);
router.post("/refresh", authController.refreshController);
router.post("/logout", authController.logoutController);

export default router;
