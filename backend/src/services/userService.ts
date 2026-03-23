import { pool } from "../db";

export class UserService {
    async getAllUsers() {
        const result = await pool.query('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC');
        return result.rows;
    }

    async deleteUser(id: number) {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
    }

    async getUserById(id: number) {
        const result = await pool.query('SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
}
