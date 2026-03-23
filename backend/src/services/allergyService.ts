import { pool } from "../db";

export class AllergyService {
    async getAllAllergies() {
        const query = "SELECT * FROM allergies ORDER BY name ASC";
        const result = await pool.query(query);
        return result.rows;
    }
}
