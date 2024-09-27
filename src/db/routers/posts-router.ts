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

const postsRouter = Router();

postsRouter.get("/posts", async (req, res) => {
  try {
    const { page, limit, username, orderBy, order } = req.query;

    const params = {
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 10,
      username: (username as string) || undefined,
      orderBy: (orderBy as "createdAt" | "likesCount") || "createdAt",
      order: (order as "asc" | "desc") || "asc",
    };

    const posts: GetPost[] = await fetchAllPosts(params);
    return res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    return res.status(500).json({ ok: false, message: "Error getting posts." });
  }
});

postsRouter.get("/posts/:username", async (req, res) => {
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
    return res.status(500).json({ ok: false, message: "Error getting posts." });
  }
});

postsRouter.post("/posts", authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user?.id;

    if (typeof userId !== "number") {
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized: Invalid user ID." });
    }

    const newPost = await createNewPost({ content, userId });
    return res.status(201).json({ ok: true, data: newPost });
  } catch (error: any) {
    if (error.message === "Invalid input data.") {
      return res
        .status(400)
        .json({ ok: false, message: "Validation error: " + error.message });
    }
    console.error("Error creating post:", error);
    return res.status(500).json({ ok: false, message: "Error creating post." });
  }
});

postsRouter.patch("/posts/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        ok: false,
        message: "At least one field must be provided for update.",
      });
    }

    const userId = req.user?.id;

    if (userId === undefined) {
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized access." });
    }

    const updatedPost = await updatePost({ id: Number(id), content, userId });
    return res.json({ ok: true, data: updatedPost });
  } catch (error: any) {
    if (error.message === "Post not found.") {
      return res.status(404).json({ ok: false, message: "Post not found." });
    }
    if (error.message === "Unauthorized access.") {
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized access." });
    }
    console.error("Error updating post:", error);
    return res.status(500).json({ ok: false, message: "Error updating post." });
  }
});

postsRouter.post("/posts/:postId/like", authenticateUser, async (req, res) => {
  const { postId } = req.params; // postId es un string
  const userId = req.user?.id; // Obteniendo el userId del objeto req después de la autenticación

  // Comprobar si userId está presente y es un número
  if (typeof userId !== "number") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Convertir postId a número
    const numericPostId = parseInt(postId, 10);
    if (isNaN(numericPostId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    // Intentar dar like al post
    const response = await likePost(userId, numericPostId);
    return res.status(200).json(response); // Asegúrate de retornar la respuesta aquí
  } catch (error) {
    // Manejo de errores
    if (error instanceof Error) {
      if (error.message === "User has already liked this post") {
        return res
          .status(400)
          .json({ message: "You have already liked this post" });
      } else if (error.message === "Post not found") {
        return res.status(404).json({ message: "Post not found" });
      } else {
        return res.status(500).json({ message: "Error liking post" });
      }
    } else {
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  }
});

postsRouter.delete(
  "/posts/:postId/like",
  authenticateUser,
  async (req, res) => {
    const { postId } = req.params; // postId es un string
    const userId = req.user?.id; // Asumiendo que el middleware establece req.user

    // Verifica si userId está definido
    if (userId === undefined) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    try {
      const post = await deleteLike(parseInt(postId), userId); // Asegúrate de que postId sea un número
      return res.status(200).json({
        ok: true,
        data: {
          id: post.id,
          content: post.content,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          username: post.username,
          likesCount: post.likesCount - 1, // Actualiza el contador de likes si es necesario
        },
      });
    } catch (error) {
      // Manejo de errores
      if (error instanceof Error) {
        if (error.message === "User has already liked this post") {
          return res
            .status(400)
            .json({ ok: false, message: "You have already liked this post" });
        } else if (error.message === "Post not found") {
          return res.status(404).json({ ok: false, message: "Post not found" });
        } else if (error.message === "Like not found") {
          return res.status(404).json({ ok: false, message: "Like not found" });
        } else {
          return res
            .status(500)
            .json({ ok: false, message: "Error unliking post" });
        }
      } else {
        return res
          .status(500)
          .json({ ok: false, message: "An unknown error occurred" });
      }
    }
  }
);

export default postsRouter;
