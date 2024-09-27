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