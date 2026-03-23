import { pool } from "../db";

export class ProfileService {
    async getAvailableCatalog() {
        const [objectivesRes, sportsRes, allergiesRes] = await Promise.all([
            pool.query("SELECT * FROM objectives ORDER BY name ASC"),
            pool.query("SELECT * FROM sports ORDER BY name ASC"),
            pool.query("SELECT * FROM allergies ORDER BY name ASC"),
        ]);

        return {
            objectives: objectivesRes.rows,
            sports: sportsRes.rows,
            allergies: allergiesRes.rows,
        };
    }

    async getUserPreferences(userId: number) {
        const [objectivesRes, sportsRes, allergiesRes] = await Promise.all([
            pool.query(
                `SELECT o.id, o.name, o.description FROM objectives o
                 JOIN user_objectives uo ON o.id = uo.objective_id
                 WHERE uo.user_id = $1`,
                [userId]
            ),
            pool.query(
                `SELECT s.id, s.name FROM sports s
                 JOIN user_sports us ON s.id = us.sport_id
                 WHERE us.user_id = $1`,
                [userId]
            ),
            pool.query(
                `SELECT a.id, a.name FROM allergies a
                 JOIN user_allergies ua ON a.id = ua.allergy_id
                 WHERE ua.user_id = $1`,
                [userId]
            ),
        ]);

        return {
            objectives: objectivesRes.rows,
            sports: sportsRes.rows,
            allergies: allergiesRes.rows,
        };
    }

    async saveUserObjectives(userId: number, ids: number[]) {
        await pool.query("DELETE FROM user_objectives WHERE user_id = $1", [userId]);
        if (ids.length > 0) {
            const values = ids.map((id, i) => `($1, $${i + 2})`).join(", ");
            await pool.query(
                `INSERT INTO user_objectives (user_id, objective_id) VALUES ${values}`,
                [userId, ...ids]
            );
        }
    }

    async saveUserSports(userId: number, ids: number[]) {
        await pool.query("DELETE FROM user_sports WHERE user_id = $1", [userId]);
        if (ids.length > 0) {
            const values = ids.map((id, i) => `($1, $${i + 2})`).join(", ");
            await pool.query(
                `INSERT INTO user_sports (user_id, sport_id) VALUES ${values}`,
                [userId, ...ids]
            );
        }
    }

    async saveUserAllergies(userId: number, ids: number[]) {
        await pool.query("DELETE FROM user_allergies WHERE user_id = $1", [userId]);
        if (ids.length > 0) {
            const values = ids.map((id, i) => `($1, $${i + 2})`).join(", ");
            await pool.query(
                `INSERT INTO user_allergies (user_id, allergy_id) VALUES ${values}`,
                [userId, ...ids]
            );
        }
    }
}
