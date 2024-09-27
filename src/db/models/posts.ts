import z from "zod";

export const GetPostSchema = z.object({
    id: z.number(), 
    content: z.string(),
    createdAt: z.date().default(() => new Date()), 
    updatedAt: z.date().default(() => new Date()),
    username: z.string(),
    likesCount: z.number().nonnegative().optional().default(0), 
  });

  export type GetPostParams = z.infer<typeof GetPostSchema>;

  export type GetPost = GetPostParams;

 export const PostSchema = z.object({
    content: z.string().min(1, "Content is required"),  
    userId: z.number().int(),  
  });
  
 export interface CreateNewPostParams {
    content: string;
    userId: number;
  }

  export const PostResponseSchema = z.object({
    ok: z.boolean(),
    data: GetPostSchema // Reutiliza GetPostSchema para validar la estructura del post
});

export type PostResponse = z.infer<typeof PostResponseSchema>;