import { pool } from "../db";

export class RecipeService {
    async getAllRecipes() {
        const result = await pool.query("SELECT * FROM recipes");
        return result.rows;
    }
}