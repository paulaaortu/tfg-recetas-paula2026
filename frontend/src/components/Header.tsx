import { useNavigate } from 'react-router-dom'
import { UserCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../assets/título.svg'
import './Header.css'

export default function Header({ onLogoClick }: { onLogoClick?: () => void }) {
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
            <div className="back-button-wrapper" onClick={() => navigate(-1)}>
                <ArrowLeft size={24} className="header-icon" />
            </div>

            <div className="logo-container" onClick={() => {
                navigate('/')
                onLogoClick?.()
            }}>
                <img src={logo} alt="Trébol Logo" className="logo-img" />
            </div>

            <div className="header-actions">
                <div className="profile-icon-wrapper" onClick={handleProfileClick}>
                    <UserCircle size={32} className="header-icon" />
                </div>

            </div>
        </header>
    )
}
