import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import * as taskController from "../../controller/taskController.js";

const router = Router();

router.post("/", authenticate, taskController.createTaskController);
router.get("/", authenticate, taskController.getAllTasksController);
router.get("/:id", authenticate, taskController.getSingleTasksController);
router.patch("/:id", authenticate, taskController.updateTaskController);
// router.put("/:id/status", authenticate, updateTaskStatusController);
router.delete("/:id", authenticate, taskController.deleteTaskController);

export default router;
