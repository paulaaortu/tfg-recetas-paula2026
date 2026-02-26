// src/components/Header.tsx
import { useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header() {
    const navigate = useNavigate()

    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="header-btn-back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#839E88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            <div className="logo-container">
                <span className="logo-icon">🍀</span>
                <h1 className="logo-text">Trébol</h1>
            </div>

            <div className="header-right">
                <button
                    className="header-btn-profile"
                    onClick={() => console.log('Login/Profile click')}
                    aria-label="Perfil"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF7F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </button>
            </div>



        </header>
    )
}
