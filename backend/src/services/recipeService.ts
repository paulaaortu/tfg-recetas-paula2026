import { pool } from "../db";

export class RecipeService {
    async getAllRecipes(official?: string) {
        let query = "SELECT * FROM recipes";
        const params: any[] = [];

        if (official !== undefined) {
            query += " WHERE is_official = $1";
            params.push(official === "true");
        }

        const result = await pool.query(query, params);
        return result.rows;
    }
}
