import React, { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Menu from '../components/Menu';
import { login } from '../services/authService';
import './Auth.css';

const LoginPage: React.FC = () => {
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
            const data = await login(email, password);
            console.log('Login success:', data);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
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
                <h1 className="auth-title">Iniciar sesión</h1>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
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

                    <button type="submit" className="auth-button">Iniciar sesión</button>
                </form>

                <div className="auth-footer">
                    ¿No tienes cuenta? <span className="auth-link" onClick={() => navigate('/register')}>Regístrate</span>
                </div>
            </div>

            <Menu
                activeTab="perfil"
                onChange={handleTabChange}
            />
        </div>
    );
};

export default LoginPage;
