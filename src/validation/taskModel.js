import { z } from "zod";

const taskPriority = z.enum(["LOW", "MEDIUM", "HIGH"]);
const taskStatus = z.enum(["TODO", "IN PROGRESS", "COMPLETED"]);

const dueDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (val === undefined || val === null) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(val);
      due.setHours(0, 0, 0, 0);
      return due >= today;
    },
    { message: "Due date must be today or a future date" },
  );

export const createTaskValidation = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must be at most 255 characters"),
    description: z.string().min(1, "Description is required"),
    dueDate: dueDateSchema,
    priority: taskPriority.optional(),
  })
  .strict();

export const updateTaskValidation = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(255, "Title must be at most 255 characters")
      .optional(),
    description: z.string().min(1, "Description is required").optional(),
    status: taskStatus.optional(),
    priority: taskPriority.optional(),
    dueDate: dueDateSchema,
    attachmentUrl: z.union([z.string().url(), z.null()]).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
