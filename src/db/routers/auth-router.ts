import express from "express";
import jwt from "jsonwebtoken";
import { validationHandler } from "../middleware/validation";
import { userSchema } from "../models/user";
import { createUser, validateCredentials } from "../services/user-service";

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

const jwtSecret = process.env['JWT_SECRET'] || "your_jwt_secret_key";

authRouter.post("/login", async (req, res, next) => {
    try {
      const user = await validateCredentials(req.body);
  
      const payload = {
        userId: user.id,
        userRole: user.role,
        name: user.username,  
      };
  
      const token = jwt.sign(payload, jwtSecret, { expiresIn: "10m" });
  
      res.json({ ok: true, data: { token } });
    } catch (error) {
      next(error);  
    }
  });
  
export default authRouter;
