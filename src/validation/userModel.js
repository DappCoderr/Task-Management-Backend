import { z } from "zod";

export const registerValidation = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

export const loginValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
