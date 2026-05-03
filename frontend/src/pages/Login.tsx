import React, { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './Auth.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Ya no se necesita información del usuario aquí para el Menú
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

    return (
        <div className="auth-contenedor">
            <div>
                <h1>Iniciar sesión</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <User className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

                    <button type="submit">Iniciar sesión</button>
                </form>

                <div className="auth-footer">
                    ¿No tienes cuenta?
                    <span onClick={() => navigate('/register')}> Regístrate</span>
                </div>
            </div>
        </div>
    );
};

export default Login;
