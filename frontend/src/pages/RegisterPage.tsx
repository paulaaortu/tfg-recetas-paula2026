import React, { useState, useEffect } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import { register } from '../services/authService';
import './Auth.css';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // No user info needed here anymore for Menu
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleTabChange = (tab: string) => {
        if (tab === 'inicio') navigate('/')
        if (tab === 'social') navigate('/social')
        if (tab === 'perfil') {
            const hasSession = localStorage.getItem('user')
            if (hasSession) navigate('/perfil')
            else navigate('/login')
        }
    };

    return (
        <div className="auth-container">
            <Header
                activeTab="perfil"
                onTabChange={handleTabChange}
            />
            <div className="auth-content">
                <h1 className="auth-title">Registrarse</h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="auth-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                    <button type="submit" className="auth-button">Regístrate</button>
                </form>

                <div className="auth-footer">
                    ¿Ya tienes cuenta? <span className="auth-link" onClick={() => navigate('/login')}>Inicia sesión</span>
                </div>
            </div>

            <Menu
                activeTab="perfil"
                onChange={handleTabChange}
            />
        </div>
    );
};

export default RegisterPage;
