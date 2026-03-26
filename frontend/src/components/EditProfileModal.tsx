import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import './EditProfileModal.css';

interface UserData {
    id: number;
    username: string;
    email: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData;
    onSave: (updatedUser: { username: string; email: string; password?: string }) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onSave({ username, email, password: password || undefined });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = username !== user.username || email !== user.email || password !== '';

    return (
        <div className="modal-editar">
            <div>
                <div>
                    <h2>Editar Perfil</h2>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de usuario</label>
                        <div>
                            <User size={20} className="input-icon" />
                            <input
                                ref={nameInputRef}
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div>
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Nueva Contraseña (dejar en blanco para no cambiar)</label>
                        <div>
                            <Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && <div className="mensaje-error">{error}</div>}

                    <div className="acciones">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="save-btn" disabled={loading || !hasChanges}>
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
