import { pool } from "../db";

export class FavoriteService {
    async getFavorites(userId: number) {
        const query = `
            SELECT r.*, c.name as category_name, u.username as author_name
            FROM recipes r
            JOIN favorites f ON r.id = f.recipe_id
            LEFT JOIN categories c ON r.category_id = c.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async addFavorite(userId: number, recipeId: number) {
        const query = `
            INSERT INTO favorites (user_id, recipe_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
        `;
        await pool.query(query, [userId, recipeId]);
    }

    async removeFavorite(userId: number, recipeId: number) {
        const query = `
            DELETE FROM favorites
            WHERE user_id = $1 AND recipe_id = $2
        `;
        await pool.query(query, [userId, recipeId]);
    }

    async isFavorite(userId: number, recipeId: number) {
        const query = `
            SELECT 1 FROM favorites
            WHERE user_id = $1 AND recipe_id = $2
        `;
        const result = await pool.query(query, [userId, recipeId]);
        return result.rowCount !== null && result.rowCount > 0;
    }
}
