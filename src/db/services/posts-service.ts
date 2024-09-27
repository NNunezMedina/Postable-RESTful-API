import z from "zod";
import {
  findPostById,
  getAllPosts,
  GetPostsParams,
  insertPost,
  updatePostInDb,
} from "../../data/posts-data";
import { GetPost, PostSchema } from "../models/posts";
import { ApiError } from "../middleware/error";

export async function fetchAllPosts(
  params: GetPostsParams
): Promise<GetPost[]> {
  const result = await getAllPosts(params);
  return result.data;
}

interface CreateNewPostParams {
  content: string;
  userId: number;
}

export async function createNewPost({
  content,
  userId,
}: CreateNewPostParams): Promise<any> {
  try {
    const validatedData = PostSchema.parse({ content, userId });

    const newPost = await insertPost(validatedData);
    return newPost;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error("Invalid input data.");
    } else {
      console.error("Error creating post:", error);
      throw new Error("Error creating post.");
    }
  }
}

export async function updatePost({
  id,
  content,
  userId,
}: {
  id: number;
  content?: string;
  userId: number;
}) {
  const post = await findPostById(id);

  if (!post) {
    throw new ApiError("Post not found.", 404);
  }

  if (Number(post.user_id) !== userId) {
    throw new ApiError("Unauthorized access.", 401);
  }

  const updateData: { content?: string } = {};
  if (content) {
    updateData.content = content;
  }

  const updatedPost = await updatePostInDb(id, updateData);
  return updatedPost;
}
