import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import * as taskController from "../../controller/taskController.js";
import { validate } from "../../validation/zodValidator.js";
import * as validation from "../../validation/taskModel.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validate(validation.createTaskValidation),
  taskController.createTaskController,
);
router.get("/", authenticate, taskController.getAllTasksController);
router.get("/:id", authenticate, taskController.getSingleTasksController);
router.patch(
  "/:id",
  authenticate,
  validate(validation.updateTaskValidation),
  taskController.updateTaskController,
);
// router.put("/:id/status", authenticate, updateTaskStatusController);
router.delete("/:id", authenticate, taskController.deleteTaskController);

export default router;
