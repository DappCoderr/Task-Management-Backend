import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";
import * as userController from "../../controller/userController.js";

const router = Router();

// USER route
router.get("/profile", authenticate, userController.getProfileController);
router.put("/profile", authenticate, userController.updateProfileController);
router.delete("/profile", authenticate, userController.deleteAccountController);

// ADMIN route
router.get(
  "/",
  authorize("ADMIN"),
  authenticate,
  userController.getAllUsersController,
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  authenticate,
  userController.deleteAnyUserController,
);

export default router;
