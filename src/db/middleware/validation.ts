import { ZodSchema, ZodError, ZodIssue } from "zod";
import { ApiError } from "./error"; 
import { NextFunction, Request, Response } from "express";

// Middleware de validación
export function validationHandler<T>(schema: ZodSchema<T>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const body = schema.parse(req.body);
      req.body = body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error);
        next(
          new ApiError("Error at validation", 400, formatIssues(error.issues))
        );
      } else {
        next(error);
      }
    }
  };
}

function formatIssues(issues: ZodIssue[]) {
  const formattedIssues: Record<string, string> = {};

  issues.forEach((issue) => {
    formattedIssues[issue.path.join(".")] = issue.message;
  });

  return formattedIssues;
}
