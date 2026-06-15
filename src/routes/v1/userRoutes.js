import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import * as userController from "../../controller/userController.js";
import { validate } from "../../validation/zodValidator.js";
import { updateProfileValidation } from "../../validation/userModel.js";

const router = Router();

router.get("/profile", authenticate, userController.getProfileController);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileValidation),
  userController.updateProfileController,
);
router.delete("/profile", authenticate, userController.deleteAccountController);

export default router;
