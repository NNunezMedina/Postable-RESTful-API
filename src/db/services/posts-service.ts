import z from "zod";
import {
  checkIfUserLikedPost,
  findPostById,
  getAllPosts,
  getLikeCountForPost,
  getPostById,
  GetPostsParams,
  insertPost,
  likePostInDb,
  removeLikeFromPost,
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
      throw new ApiError("Invalid input data.", 400);
    } else {
      console.error("Error creating post:", error);
      throw new ApiError("Error creating post.", 500);
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

export const likePost = async (userId: number, postId: number) => {
  const alreadyLiked = await checkIfUserLikedPost(postId, userId);
  if (alreadyLiked) {
    throw new ApiError("User has already liked this post", 400);
  }

  await likePostInDb(postId, userId);

  const likesCount = await getLikeCountForPost(postId);

  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError("Post not found", 404);
  }

  return {
    ok: true,
    data: {
      id: post.id,
      content: post.content,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      username: "usuario",
      likesCount: likesCount,
    },
  };
};

export async function deleteLike(postId: number, userId: number) {
  try {
    const post = await removeLikeFromPost(postId, userId);
    return post;
  } catch (error) {
    const e = error as Error;

    if (e.message === "Post not found") {
      throw new ApiError("Post not found", 404);
    } else if (e.message === "Like not found") {
      throw new ApiError("Like not found", 404);
    }
    throw new ApiError("Internal Server Error", 500);
  }
}
