import { query } from "../db";
import { GetPostSchema } from "../db/models/posts";
import { buildPagination} from "./utils";

export interface GetPostsParams {
  page?: number;
  limit?: number;
  username?: string;
  orderBy?: "createdAt" | "likesCount";
  order?: "asc" | "desc";
}

export async function getAllPosts(params: GetPostsParams) {
  const {
    page = 1,
    limit = 10,
    username,
    orderBy = "createdAt",
    order = "asc",
  } = params;

  const { offset } = buildPagination({ page, limit });

  let sqlQuery: string;
  let fullQueryParams: any[];

  const orderField = orderBy === "likesCount" ? "likes_count" : "p.created_at";

  if (username) {
    sqlQuery = `
    SELECT 
      p.*, 
      u.username,
      COALESCE((SELECT COUNT(*) FROM likes WHERE post_id = p.id), 0) AS likes_count
    FROM 
      posts p
    LEFT JOIN 
      users u ON p.user_id = u.id
    WHERE 
      u.username = $1
    ORDER BY 
      ${orderField} ${order} 
    LIMIT 
      $2 OFFSET $3
  `;
  fullQueryParams = [username, limit, offset];
  } else {
    sqlQuery = `
      SELECT 
        p.*, 
        u.username,
        COALESCE((SELECT COUNT(*) FROM likes WHERE post_id = p.id), 0) AS likes_count
      FROM 
        posts p
      LEFT JOIN 
        users u ON p.user_id = u.id
      ORDER BY 
        p.created_at ${order} 
      LIMIT 
        $1 OFFSET $2
    `;
    fullQueryParams = [limit, offset];
  }

  try {
    const result = await query(sqlQuery, fullQueryParams);

    const totalItemsResult = await query(
      `
        SELECT COUNT(*) AS total
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ${username ? "WHERE u.username = $1" : ""}
      `,
      username ? [username] : []
    );

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
      data: result.rows.map((post) => {
        return {
          ...GetPostSchema.parse(post),
          likesCount: post.likes_count,
        };
      }),
      pagination,
    };
  } catch (error) {
    console.error("Error getting posts from database:", error);
    throw new Error("Error getting posts.");
  }
}

interface CreatePostParams {
  content: string;
  userId: number;
}
export async function insertPost({
  content,
  userId,
}: CreatePostParams): Promise<any> {
  const sql = `
      INSERT INTO posts (content, user_id, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, content, created_at AS "createdAt", updated_at AS "updatedAt", $2 AS "userId", 0 AS "likesCount";
    `;

  const params = [content, userId];
  const result = await query(sql, params);


  return result.rows[0];
}

export async function findPostById(id: number) {
  const { rows } = await query("SELECT * FROM posts WHERE id = $1", [id]);
  return rows[0];
}

export async function updatePostInDb(
  id: number,
  updateData: { content?: string }
) {
  const { content } = updateData;

  if (content === undefined) {
    throw new Error("Content must be provided for update.");
  }

  const { rows } = await query(
    "UPDATE posts SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [content, id]
  );

  return rows[0];
}

type QueryResult = {
    rowCount: number | null;
    rows: any[];
  };

export const checkIfUserLikedPost = async (postId: number, userId: number) => {
  const result: QueryResult = await query(
    `SELECT * FROM likes WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );

  return result.rowCount !== null && result.rowCount > 0;
};

export const likePostInDb = async (postId: number, userId: number) => {
  await query(
    `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)`,
    [postId, userId]
  );
};

export const getLikeCountForPost = async (postId: number) => {
  const result: QueryResult = await query(
    `SELECT COUNT(*) AS likes_count FROM likes WHERE post_id = $1`,
    [postId]
  );
  return parseInt(result.rows[0].likes_count, 10) ;
};

export const getPostById = async (postId: number) => {
  const result: QueryResult = await query(
    `SELECT id, content, created_at, updated_at, user_id FROM posts WHERE id = $1`,
    [postId]
  );
  return result.rows[0];
};

export async function removeLikeFromPost(postId: number, userId: number) {
  try {
    const post = await query('SELECT * FROM posts WHERE id = $1', [postId]);

    if (!post.rows.length) {
      throw new Error('Post not found');
    }

    const result = await query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING *',
      [postId, userId]
    );

    if (!result.rows.length) {
      throw new Error('Like not found');
    }

    const likesCountResult = await query(
      'SELECT COUNT(*) as likes_count FROM likes WHERE post_id = $1',
      [postId]
    );

    const likesCount = parseInt(likesCountResult.rows[0].likes_count, 10);

    return {
      ...post.rows[0],
      likesCount,
    };
  } catch (error) {
    console.error('Error in removeLikeFromPost:', error);
    throw error;
  }
}

