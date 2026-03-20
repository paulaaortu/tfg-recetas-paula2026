import { pool } from "../db";

export class ProfileService {
    async getAvailableCatalog() {
        const [intolerancesRes, objectivesRes, sportsRes] = await Promise.all([
            pool.query("SELECT * FROM intolerances ORDER BY name ASC"),
            pool.query("SELECT * FROM objectives ORDER BY name ASC"),
            pool.query("SELECT * FROM sports ORDER BY name ASC"),
        ]);

        return {
            intolerances: intolerancesRes.rows,
            objectives: objectivesRes.rows,
            sports: sportsRes.rows,
        };
    }

    async getUserPreferences(userId: number) {
        const [intolerancesRes, objectivesRes, sportsRes] = await Promise.all([
            pool.query(
                `SELECT i.id, i.name FROM intolerances i
                 JOIN user_intolerances ui ON i.id = ui.intolerance_id
                 WHERE ui.user_id = $1`,
                [userId]
            ),
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
        ]);

        return {
            intolerances: intolerancesRes.rows,
            objectives: objectivesRes.rows,
            sports: sportsRes.rows,
        };
    }

    async saveUserIntolerances(userId: number, ids: number[]) {
        await pool.query("DELETE FROM user_intolerances WHERE user_id = $1", [userId]);
        if (ids.length > 0) {
            const values = ids.map((id, i) => `($1, $${i + 2})`).join(", ");
            await pool.query(
                `INSERT INTO user_intolerances (user_id, intolerance_id) VALUES ${values}`,
                [userId, ...ids]
            );
        }
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
}
