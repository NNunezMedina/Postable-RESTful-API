import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "./error";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; name: string; role: string }; 
    }
  }
}

const jwtSecret = process.env["JWT_SECRET"] || "your_jwt_secret_key";

export function authenticateUser(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("Token recibido:", token); 

  if (!token) {
    return next(new ApiError("No autorizado", 401));
  }

  console.log("JWT Secret:", jwtSecret);

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      userId: number; 
      userRole: string;
      name: string;
      iat: number;
      exp: number;
    };

    req.user = { id: payload.userId, name: payload.name, role: payload.userRole };
    console.log("Usuario autenticado:", req.user); 
    next();
  } catch (error) {
    console.error("Error de autenticación:", error);
    return next(new ApiError("No autorizado", 401));
  }
}
