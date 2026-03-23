import { pool } from "../db";

export class CategoryService {
    async getCategories() {
        const query = "SELECT * FROM categories ORDER BY name ASC";
        const result = await pool.query(query);
        return result.rows;
    }
}
