import React, { useState, useEffect } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import './Auth.css';

const Register: React.FC = () => {
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

    return (
        <div className="auth-contenedor">
            <div>
                <h1>Registrarse</h1>

                <form onSubmit={handleSubmit}>
                    <div>
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Mail className="input-icon" size={20} />
                        <input
                            type="email"
                            placeholder="E-mail"
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

                    <button type="submit">Regístrate</button>
                </form>

                <div>
                    ¿Ya tienes cuenta? <span onClick={() => navigate('/login')}>Inicia sesión</span>
                </div>
            </div>
        </div>
    );
};

export default Register;
