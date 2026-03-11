import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string, search?: string, category?: string) {
        let query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
        `;
        const params: any[] = [];
        let conditions: string[] = [];

        if (official !== undefined) {
            params.push(official === "true");
            conditions.push(`r.is_official = $${params.length}`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(r.title ILIKE $${params.length} OR r.description ILIKE $${params.length})`);
        }

        if (category && category !== 'Ver todo' && category !== 'undefined') {
            params.push(category);
            conditions.push(`c.name = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    async getCategories() {
        const query = "SELECT * FROM categories ORDER BY name ASC";
        const result = await pool.query(query);
        return result.rows;
    }

    async getRecipeById(id: number) {
        const query = `
            SELECT r.*, c.name as category_name 
            FROM recipes r
            LEFT JOIN categories c ON r.category_id = c.id
            WHERE r.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}
