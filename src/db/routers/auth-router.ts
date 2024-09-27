import express from "express";
import jwt from "jsonwebtoken";
import { validationHandler } from "../middleware/validation";
import { userSchema } from "../models/user";
import { createUser, deleteUser, validateCredentials } from "../services/user-service";
import { authenticateUser } from "../middleware/authenticate";

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

  authRouter.delete("/me", authenticateUser, async (req, res, next) => {
    try {
      const username = req.user;

      if (!username) {
        return res.status(400).json({ ok: false, message: "Usuario no autenticado" });
      }
  
      await deleteUser(username);
  
      return res.status(200).json({ ok: true }); 
    } catch (error) {
        return res.status(500).json({ ok: false });
    }
  });

export default authRouter;
