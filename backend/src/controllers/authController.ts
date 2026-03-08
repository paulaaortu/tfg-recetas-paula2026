import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET || 'jsnE982nsAsok.';
const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        const existe = await authService.findUser({ email, username });

        if (existe) {
            return res.status(400).json({ message: 'El usuario o email ya existe.' });
        }

        const salt = 10;
        const passwordHasheada = await bcrypt.hash(password, salt);

        const usuario = await authService.createUser(username, email, passwordHasheada);

        res.status(201).json({
            message: 'Usuario registrado correctamente.',
            user: usuario,
        });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const usuario = await authService.findUser({ email });

        if (!usuario) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const coinciden = await bcrypt.compare(password, usuario.password_hash);

        if (!coinciden) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, username: usuario.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login correcto.',
            token,
            user: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
            },
        });
    } catch (error) {
        console.error('Error al hacer login:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        let passwordHasheada;
        if (password) {
            const salt = 10;
            passwordHasheada = await bcrypt.hash(password, salt);
        }

        const usuario = await authService.updateUser(id as string, username, email, passwordHasheada);

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({
            message: 'Perfil actualizado correctamente.',
            user: usuario,
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
