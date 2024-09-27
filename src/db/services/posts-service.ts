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

export const likePost = async (userId: number, postId: number) => {
    // Verificar si el usuario ya ha dado like al post
    const alreadyLiked = await checkIfUserLikedPost(postId, userId);
    if (alreadyLiked) {
      throw new Error('User has already liked this post');
    }
  
    // Insertar el like en la base de datos
    await likePostInDb(postId, userId);
  
    // Obtener el número de likes actualizados para el post
    const likesCount = await getLikeCountForPost(postId);
  
    // Obtener la información del post
    const post = await getPostById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
  
    // Retornar los datos del post con la cuenta de likes actualizada
    return {
      ok: true,
      data: {
        id: post.id,
        content: post.content,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        username: 'usuario', // Aquí deberías usar lógica para obtener el nombre de usuario basado en user_id si es necesario
        likesCount: likesCount,
      },
    };
  };

  export async function deleteLike(postId: number, userId: number) {
    try {
      const post = await removeLikeFromPost(postId, userId);
      return post;
    } catch (error) {
      const e = error as Error; // Afirmación de tipo
  
      if (e.message === 'Post not found') {
        throw { status: 404, message: 'Post not found' };
      } else if (e.message === 'Like not found') {
        throw { status: 404, message: 'Like not found' };
      }
      throw { status: 500, message: 'Internal Server Error' };
    }
  }
