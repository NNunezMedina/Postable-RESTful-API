import express from "express";
import { authenticateUser } from "../middleware/authenticate";
import { ApiError } from "../middleware/error";
import { getUserProfile } from "../services/user-service";

const userRouter = express.Router();

userRouter.get("/me", authenticateUser, async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError("Not authorized", 401));
    }
    const userProfile = await getUserProfile(req.user.id);
    res.json({
      ok: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    next(new ApiError("Error getting user profile.", 500));
  }
});

export default userRouter;