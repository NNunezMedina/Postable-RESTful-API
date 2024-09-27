import { getAllPosts, GetPostsParams } from "../../data/posts-data";
import { GetPost } from "../models/posts";

export async function fetchAllPosts(params: GetPostsParams): Promise<GetPost[]> {
    const result = await getAllPosts(params); 
    return result.data; 
}