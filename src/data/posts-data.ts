import { query } from "../db";
import { GetPostSchema } from "../db/models/posts";
import { buildPagination, buildQueryAndParams } from "./utils";

export interface GetPostsParams {
    page?: number;
    limit?: number;
    username?: string;
    orderBy?: 'createdAt' | 'likesCount';
    order?: 'asc' | 'desc';
}

export async function getAllPosts(params: GetPostsParams) {
    const {
        page = 1,
        limit = 10,
        username,
        orderBy = 'createdAt',
        order = 'asc'
    } = params;

    const { offset } = buildPagination({ page, limit });
    const { query: sqlQuery, params: queryParams } = buildQueryAndParams({ username, orderBy, order, offset, limit });

    try {
        const result = await query(sqlQuery, queryParams); 

        const totalItemsResult = await query(`
            SELECT COUNT(*) AS total
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            ${username ? 'WHERE u.username = $1' : ''}
        `, username ? [username] : []);
        
        const totalItems = parseInt(totalItemsResult.rows[0].total, 10);
        
        const totalPages = Math.ceil(totalItems / limit);
        const nextPage = page < totalPages ? page + 1 : null;
        const previousPage = page > 1 ? page - 1 : null;

        const pagination = {
            page,
            pageSize: limit,
            totalItems,
            totalPages,
            nextPage,
            previousPage,
        };

        return {
            ok: true,
            data: result.rows.map(post => GetPostSchema.parse(post)),
            pagination,
        };
        
    } catch (error) {
        console.error("Error getting posts from database:", error);
        throw new Error("Error getting posts.");
    }
}