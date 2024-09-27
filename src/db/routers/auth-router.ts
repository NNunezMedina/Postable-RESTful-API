import express from "express";
import { validationHandler } from "../middleware/validation";
import { userSchema } from "../models/user";
import { createUser } from "../services/user-service";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  validationHandler(userSchema),
  async (req, res, next) => {
    try {
      const newUser = await createUser(req.body);
      const response = {
        ok: true,
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        }
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default authRouter;
