import { Router } from 'express';
import { getCatalog, getPreferences, savePreferences } from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/catalog', getCatalog);
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, savePreferences);

export default router;
