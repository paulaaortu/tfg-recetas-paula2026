import { Router } from 'express';
import { register, login, updateUser, uploadAvatar } from '../controllers/authController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/register', (req, res, next) => {
    register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
    login(req, res).catch(next);
});

router.post('/upload-avatar', upload.single('avatar'), (req, res, next) => {
    uploadAvatar(req, res).catch(next);
});

router.put('/update/:id', (req, res, next) => {
    updateUser(req, res).catch(next);
});

export default router;
