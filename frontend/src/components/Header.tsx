import { useNavigate } from 'react-router-dom'
import { UserCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../assets/título.svg'
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

                <nav className="desktop-nav">
                    <a href="#" onClick={(e) => { e.preventDefault(); onTabChange?.('inicio'); }} className={activeTab === 'inicio' ? 'active' : ''}>Inicio</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onTabChange?.('buscar'); }} className={activeTab === 'buscar' ? 'active' : ''}>Explorar</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onTabChange?.('despensa'); }} className={activeTab === 'despensa' ? 'active' : ''}>Despensa</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onTabChange?.('social'); }} className={activeTab === 'social' ? 'active' : ''}>Social</a>
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
