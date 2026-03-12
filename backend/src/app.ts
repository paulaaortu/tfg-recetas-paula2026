import express from 'express';
import cors from 'cors';
import recipesRoutes from './routes/recipeRoute';
import authRoutes from './routes/authRoutes';
import pantryRoutes from './routes/pantryRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);

export default app;
