import { pool } from "../db";

export class AuthService {
    async findUser(query: { email?: string; username?: string }) {
        const { email, username } = query;
        let sql = 'SELECT * FROM users WHERE ';
        const params: any[] = [];

        if (email && username) {
            sql += 'email = $1 OR username = $2';
            params.push(email, username);
        } else if (email) {
            sql += 'email = $1';
            params.push(email);
        } else if (username) {
            sql += 'username = $1';
            params.push(username);
        } else {
            return null;
        }

        const result = await pool.query(sql, params);
        return result.rows[0];
    }

    async createUser(username: string, email: string, passwordHash: string) {
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );
        return result.rows[0];
    }

    async updateUser(id: string, username: string, email: string, passwordHash?: string) {
        let query = 'UPDATE users SET username = $1, email = $2';
        const params: any[] = [username, email];

        if (passwordHash) {
            query += ', password_hash = $3 WHERE id = $4';
            params.push(passwordHash, id);
        } else {
            query += ' WHERE id = $3';
            params.push(id);
        }

        const result = await pool.query(query + ' RETURNING id, username, email', params);
        return result.rows[0];
    }
}
