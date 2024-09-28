export interface PaginationParams {
    page?: number;
    limit?: number;
}

export function buildPagination({ page = 1, limit = 10 }: PaginationParams) {
    const offset = (page - 1) * limit;
    return { offset, limit };
}

export function buildQueryAndParams({
    username,
    orderBy = 'createdAt',
    order = 'asc',
    offset,
    limit,
}: {
    username?: string;
    orderBy?: 'createdAt' | 'likesCount';
    order?: 'asc' | 'desc';
    offset: number;
    limit: number;
}): { query: string; params: (string | number)[] } {
    const baseQuery = `
        SELECT 
            p.id,
            p.content,
            p.created_at AS createdAt,
            p.updated_at AS updatedAt,
            p.user_id AS userId,
            u.username,
            COUNT(l.id) AS likesCount
        FROM posts p
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN users u ON p.user_id = u.id
    `;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (username) {
        conditions.push(`u.username = $${params.length + 1}`);
        params.push(username);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderByColumn = orderBy === 'likesCount' ? 'likesCount' : 'p.created_at';
    const orderDirection = order === 'asc' ? 'ASC' : 'DESC';

    const query = `${baseQuery} ${whereClause} 
        GROUP BY p.id, p.content, p.created_at, p.updated_at, p.user_id, u.username 
        ORDER BY ${orderByColumn} ${orderDirection} 
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(limit, offset);

    return { query, params };
}