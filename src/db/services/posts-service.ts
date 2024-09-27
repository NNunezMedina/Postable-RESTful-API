import z from "zod";
import { getAllPosts, GetPostsParams, insertPost } from "../../data/posts-data";
import { GetPost, PostSchema } from "../models/posts";

export async function fetchAllPosts(params: GetPostsParams): Promise<GetPost[]> {
    const result = await getAllPosts(params); 
    return result.data; 
}

interface CreateNewPostParams {
    content: string;
    userId: number;
  }

  export async function createNewPost({ content, userId }: CreateNewPostParams): Promise<any> {
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