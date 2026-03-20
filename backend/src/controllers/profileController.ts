import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import jwt from 'jsonwebtoken';

const profileService = new ProfileService();
const JWT_SECRET = process.env.JWT_SECRET || 'jsnE982nsAsok.';

// Helper to get userId from token
function getUserId(req: Request): number | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
            return decoded.id;
        } catch {
            return null;
        }
    }
    return null;
}

export const getCatalog = async (req: Request, res: Response) => {
    try {
        const catalog = await profileService.getAvailableCatalog();
        res.json(catalog);
    } catch (error) {
        res.status(500).json({ error: "Error cargando el catálogo de preferencias" });
    }
};

export const getPreferences = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });
        const preferences = await profileService.getUserPreferences(user.id);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: "Error cargando preferencias del usuario" });
    }
};

export const savePreferences = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user || !user.id) return res.status(401).json({ message: "No autorizado" });

        const { intolerance_ids, objective_ids, sport_ids } = req.body;

        await Promise.all([
            profileService.saveUserIntolerances(user.id, intolerance_ids || []),
            profileService.saveUserObjectives(user.id, objective_ids || []),
            profileService.saveUserSports(user.id, sport_ids || []),
        ]);

        const updated = await profileService.getUserPreferences(user.id);
        res.json({ message: "Preferencias guardadas correctamente", ...updated });
    } catch (error) {
        console.error("Error guardando preferencias:", error);
        res.status(500).json({ error: "Error guardando preferencias del usuario" });
    }
};
