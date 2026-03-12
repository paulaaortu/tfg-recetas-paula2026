import { Response } from 'express';
import { PantryService } from '../services/pantryService';
import { AuthRequest } from '../middlewares/authMiddleware';

const pantryService = new PantryService();

export const getPantry = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Usuario no identificado' });

        const items = await pantryService.getUserPantry(userId);
        res.json(items);
    } catch (error) {
        console.error('Error al obtener despensa:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const addItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { ingredient_name, quantity, unit } = req.body;

        if (!userId) return res.status(401).json({ message: 'Usuario no identificado' });
        if (!ingredient_name) return res.status(400).json({ message: 'El nombre del ingrediente es obligatorio' });

        const newItem = await pantryService.addPantryItem(userId, ingredient_name, quantity, unit);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error al añadir a la despensa:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const removeItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ message: 'Usuario no identificado' });

        const success = await pantryService.deletePantryItem(userId, parseInt(id as string));
        if (!success) {
            return res.status(404).json({ message: 'Elemento no encontrado en tu despensa' });
        }

        res.json({ message: 'Elemento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar de la despensa:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
