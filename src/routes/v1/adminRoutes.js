import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authMiddleware.js";
import * as admin from "../../controller/adminController.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  admin.getAdminDashboardController,
);
router.get(
  "/users",
  authenticate,
  authorize("ADMIN"),
  admin.getAllUsersController,
);
router.get(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  admin.getUserProfileController,
);
router.get(
  "/users/:id/tasks",
  authenticate,
  authorize("ADMIN"),
  admin.getUserTasksController,
);
router.delete(
  "/users/:id",
  authenticate,
  authorize("ADMIN"),
  admin.deleteUserController,
);

export default router;
