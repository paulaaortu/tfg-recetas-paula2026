import { useNavigate } from 'react-router-dom'
import { UserCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../assets/título.svg'
import { TABS } from './Menu'
import type { Tab } from './Menu'
import './Header.css'

interface HeaderProps {
    onLogoClick?: () => void
    activeTab?: Tab
    onTabChange?: (tab: Tab) => void
}

export default function Header({ onLogoClick, activeTab, onTabChange }: HeaderProps) {
    const navigate = useNavigate()
    const handleProfileClick = () => {
        if (onTabChange) {
            onTabChange('perfil');
        } else {
            // Fallback en caso de que no se pase onTabChange
            const hasSession = localStorage.getItem('user');
            navigate(hasSession ? '/perfil' : '/login');
        }
    }

    return (
        <header>
            <div>
                <div className="logo-contenedor">
                    <div className="botones" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} />
                    </div>

                    <div className="logo" onClick={() => {
                        navigate('/')
                        onLogoClick?.()
                    }}>
                        <img src={logo} alt="Trébol Logo" />
                    </div>
                </div>

                <nav>
                    {TABS.filter(tab => tab.id !== 'buscar').map((tab) => (
                        <button
                            key={tab.id}
                            className={`header-activo ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange?.(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="acciones">
                    <div className="botones" onClick={handleProfileClick}>
                        <UserCircle size={32} className="header-icon" />
                    </div>
                </div>
            </div>
        </header>
    )
}
