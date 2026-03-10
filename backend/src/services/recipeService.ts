import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string, search?: string, category?: string) {
        let query = "SELECT * FROM recipes";
        const params: any[] = [];
        let conditions: string[] = [];

        if (official !== undefined) {
            params.push(official === "true");
            conditions.push(`is_official = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
        }

        if (category && category !== 'Ver todo' && category !== 'undefined') {
            params.push(`%${category}%`);
            conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    async getRecipeById(id: number) {
        const query = "SELECT * FROM recipes WHERE id = $1";
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}
