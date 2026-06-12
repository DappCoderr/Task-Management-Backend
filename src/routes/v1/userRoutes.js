import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";
import {
  getProfileController,
  updateProfileController,
  deleteAccountController,
  getAllUsersController,
  deleteAnyUserController,
} from "../../controller/userController.js";

const router = Router();

// USER route
router.get("/profile", authenticate, getProfileController);
router.put("/profile", authenticate, updateProfileController);
router.delete("/profile", authenticate, deleteAccountController);

// ADMIN route
router.get("/", authorize("ADMIN"), authenticate, getAllUsersController);
router.delete(
  "/:id",
  authorize("ADMIN"),
  authenticate,
  deleteAnyUserController,
);

export default router;
