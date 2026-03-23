import { Request, Response } from 'express';
import { ProfileService } from '../services/profileService';
import jwt from 'jsonwebtoken';

const profileService = new ProfileService();
const JWT_SECRET = process.env.JWT_SECRET || 'jsnE982nsAsok.';

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

        const { objective_ids, sport_ids, allergy_ids } = req.body;

        await Promise.all([
            profileService.saveUserObjectives(user.id, objective_ids || []),
            profileService.saveUserSports(user.id, sport_ids || []),
            profileService.saveUserAllergies(user.id, allergy_ids || []),
        ]);

        const updated = await profileService.getUserPreferences(user.id);
        res.json({ message: "Preferencias guardadas correctamente", ...updated });
    } catch (error) {
        console.error("Error guardando preferencias:", error);
        res.status(500).json({ error: "Error guardando preferencias del usuario" });
    }
};
