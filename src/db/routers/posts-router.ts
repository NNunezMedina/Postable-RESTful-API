import { Router } from "express";
import {
  createNewPost,
  deleteLike,
  fetchAllPosts,
  likePost,
  updatePost,
} from "../services/posts-service";
import { GetPost } from "../models/posts";
import { authenticateUser } from "../middleware/authenticate";
import { ApiError } from "../middleware/error";

const postsRouter = Router();

postsRouter.get("/posts", async (req, res, next) => {
  try {
    const { page, limit, username, orderBy, order } = req.query;

    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);

    const params = {
      page: !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      limit: !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10,
      username: (username as string) || undefined,
      orderBy: (orderBy as "createdAt" | "likesCount") || "createdAt",
      order: (order as "asc" | "desc") || "asc",
    };

    if (!["createdAt", "likesCount"].includes(params.orderBy)) {
      params.orderBy = "createdAt";
    }

    if (!["asc", "desc"].includes(params.order)) {
      params.order = "asc";
    }

    const posts: GetPost[] = await fetchAllPosts(params);
    return res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    return next(new ApiError("Error getting posts", 500));
  }
});

postsRouter.get("/posts/:username", async (req, res, next) => {
  try {
    const { page, limit, orderBy, order } = req.query;
    const { username } = req.params;

    const params = {
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 10,
      username: username as string,
      orderBy: (orderBy as "createdAt" | "likesCount") || "createdAt",
      order: (order as "asc" | "desc") || "asc",
    };

    const posts: GetPost[] = await fetchAllPosts(params);
    return res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    return next(new ApiError("Error getting posts", 500));
  }
});

postsRouter.post("/posts", authenticateUser, async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (typeof userId !== "number") {
      throw new ApiError("Unauthorized: Invalid user ID.", 401);
    }

    const newPost = await createNewPost({ content, userId });
    return res.status(201).json({ ok: true, data: newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    return next(new ApiError("Error creating post", 500));
  }
});

postsRouter.patch("/posts/:id", authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new ApiError(
        "At least one field must be provided for update.",
        400
      );
    }

    const userId = req.user?.id;

    if (userId === undefined) {
      throw new ApiError("Unauthorized access.", 401);
    }

    const updatedPost = await updatePost({ id: Number(id), content, userId });
    return res.json({ ok: true, data: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    return next(new ApiError("Error updating post.", 500));
  }
});

postsRouter.post(
  "/posts/:postId/like",
  authenticateUser,
  async (req, res, next) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (typeof userId !== "number") {
      throw new ApiError("Unauthorized", 401);
    }

    try {
      const numericPostId = parseInt(postId, 10);
      if (isNaN(numericPostId)) {
        throw new ApiError("Invalid postId", 400);
      }

      const response = await likePost(userId, numericPostId);
      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User has already liked this post") {
          return next(new ApiError("You have already liked this post", 400));
        } else if (error.message === "Post not found") {
          return next(new ApiError("Post not found", 404));
        }
      }
      console.error("Error liking post:", error);
      return next(new ApiError("Error liking post", 500));
    }
  }
);

postsRouter.delete(
  "/posts/:postId/like",
  authenticateUser,
  async (req, res, next) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (userId === undefined) {
      return next(new ApiError("Unauthorized", 401));
    }

    try {
      const post = await deleteLike(parseInt(postId), userId);
      const likesCount = Math.max((post.likesCount ?? 0) - 1, 0);
      return res.status(200).json({
        ok: true,
        data: {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          username: post.username,
          likesCount,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Post not found") {
          return next(new ApiError("Post not found", 404));
        } else if (error.message === "Like not found") {
          return next(new ApiError("Like not found", 404));
        }
      }
      console.error("Error unliking post:", error);
      return next(new ApiError("Error unliking post", 500));
    }
  }
);

export default postsRouter;
