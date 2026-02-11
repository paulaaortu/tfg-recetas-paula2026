import app from './app';
import { pool } from './db';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conectado a PostgreSQL:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
  }
})();

