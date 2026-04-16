import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Lock, Camera } from 'lucide-react';
import { uploadAvatar } from '../services/authService';
import './EditProfileModal.css';

interface UserData {
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData;
    onSave: (updatedUser: { username: string; email: string; password?: string; avatar_url?: string }) => Promise<void>;
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            let avatar_url = user.avatar_url;

            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const uploadRes = await uploadAvatar(formData);
                avatar_url = uploadRes.imageUrl;
            }

            await onSave({ username, email, password: password || undefined, avatar_url });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = username !== user.username || email !== user.email || password !== '' || avatarFile !== null;

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
                    <div className="avatar-section">
                        <div className="avatar-preview-container" onClick={() => fileInputRef.current?.click()}>
                            {avatarPreview ? (
                                <img src={avatarPreview.startsWith('data:') ? avatarPreview : `http://localhost:3001${avatarPreview}`} alt="Avatar preview" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={40} />
                                </div>
                            )}
                            <div className="avatar-overlay">
                                <Camera size={20} />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <button type="button" className="change-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                            Cambiar foto
                        </button>
                    </div>

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
