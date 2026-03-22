import { Request, Response } from 'express';
import { pool } from '../db';
import { RecipeService } from '../services/recipeService';

const recipeService = new RecipeService();

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};

export const deleteRecipe = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
        res.json({ message: 'Receta eliminada correctamente.' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Error al eliminar receta.' });
    }
};

export const getAdminRecipes = async (req: Request, res: Response) => {
    const { type } = req.query; // 'official' or 'user'
    try {
        let recipes;
        if (type === 'official') {
            recipes = await recipeService.getAllRecipes('true');
        } else {
            recipes = await recipeService.getAllRecipes('false');
        }
        res.json(recipes);
    } catch (error) {
        console.error('Error getting admin recipes:', error);
        res.status(500).json({ message: 'Error al obtener recetas.' });
    }
};
