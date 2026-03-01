import { pool } from './src/db.js';

async function checkDB() {
    try {
        const res = await pool.query('SELECT id, title, is_official FROM recipes');
        console.log('Recipes in DB:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await pool.end();
    }
}

checkDB();
