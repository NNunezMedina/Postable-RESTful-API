import { Router } from "express";
import { fetchAllPosts } from "../services/posts-service";
import { GetPost } from "../models/posts";

const postsRouter = Router();

postsRouter.get("/posts", async (req, res) => {
  try {

    const { page, limit, username, orderBy, order } = req.query;

    const params = {
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 10,
      username: username as string || undefined,
      orderBy: orderBy as 'createdAt' | 'likesCount' || 'createdAt',
      order: order as 'asc' | 'desc' || 'asc',
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
      orderBy: orderBy as 'createdAt' | 'likesCount' || 'createdAt',
      order: order as 'asc' | 'desc' || 'asc',
    };

    const posts: GetPost[] = await fetchAllPosts(params);
    return res.json(posts);
  } catch (error) {
    console.error("Error getting posts:", error);
    return res.status(500).json({ ok: false, message: "Error getting posts." });
  }
});

export default postsRouter;