import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { pool } from './db';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Conectado a PostgreSQL correctamente');
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
  }
})();

