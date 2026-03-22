import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
    next();
};
