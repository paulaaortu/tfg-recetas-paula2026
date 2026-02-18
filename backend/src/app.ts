import express from 'express';
import cors from 'cors';
import recipesRoutes from './routes/recipeRoute';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRoutes);

export default app;
