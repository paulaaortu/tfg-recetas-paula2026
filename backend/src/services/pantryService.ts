import { pool } from '../db';

export class PantryService {
    async getUserPantry(userId: number) {
        const result = await pool.query(
            'SELECT * FROM pantry WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    async addPantryItem(userId: number, ingredientName: string, quantity: number | null, unit: string | null) {
        const result = await pool.query(
            'INSERT INTO pantry (user_id, ingredient_name, quantity, unit) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, ingredientName, quantity, unit]
        );
        return result.rows[0];
    }

    async deletePantryItem(userId: number, itemId: number) {
        const result = await pool.query(
            'DELETE FROM pantry WHERE id = $1 AND user_id = $2 RETURNING *',
            [itemId, userId]
        );
        return result.rowCount ? result.rowCount > 0 : false;
    }
}
