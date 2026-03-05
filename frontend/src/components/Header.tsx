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
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const user = localStorage.getItem('user')
        setIsLoggedIn(!!user)
    }, [])

    const handleProfileClick = () => {
        if (isLoggedIn) {
            navigate('/perfil')
        } else {
            navigate('/login')
        }
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div className="back-button-wrapper" onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} className="header-icon" />
                    </div>

                    <div className="logo-container" onClick={() => {
                        navigate('/')
                        onLogoClick?.()
                    }}>
                        <img src={logo} alt="Trébol Logo" className="logo-img" />
                    </div>
                </div>

                <nav className="header-nav">
                    {TABS.filter(tab => tab.id !== 'buscar').map((tab) => (
                        <button
                            key={tab.id}
                            className={`header-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange?.(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    <div className="profile-icon-wrapper" onClick={handleProfileClick}>
                        <UserCircle size={32} className="header-icon" />
                    </div>
                </div>
            </div>
        </header>
    )
}
