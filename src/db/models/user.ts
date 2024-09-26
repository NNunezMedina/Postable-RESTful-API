import { z } from "zod";

export const userSchema = z.object({
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(3, "Username must be at least 3 characters long")
    .refine((val) => !val.includes(" "), "Username cannot contain spaces"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email format",
    }),
  firstName: z.string().optional(),
  lastName: z.string().optional(), 
  role: z
    .enum(["user", "admin"], {
      invalid_type_error: "Role must be a string",
    })
    .default("user"),
  createdAt: z.date().default(() => new Date()), 
  updatedAt: z.date().default(() => new Date()),
});

export type UserParams = z.infer<typeof userSchema>;
export type User = UserParams & { id: number };



