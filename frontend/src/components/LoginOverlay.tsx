import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './LoginOverlay.css';

interface LoginOverlayProps {
    pageName: string;
}

const LoginOverlay: React.FC<LoginOverlayProps> = ({ pageName }) => {
    const navigate = useNavigate();

    return (
        <div className="login-overlay-container">
            <div className="login-overlay-content">
                <div className="login-overlay-icon">
                    <Lock size={48} />
                </div>
                <h2>Acceso Restringido</h2>
                <p>
                    Para poder ver el <strong>{pageName}</strong>, necesitas registrarte o iniciar sesión en tu cuenta.
                </p>
                <div className="login-overlay-buttons">
                    <button
                        className="login-overlay-btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className="login-overlay-btn-secondary"
                        onClick={() => navigate('/register')}
                    >
                        Crear Cuenta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginOverlay;
