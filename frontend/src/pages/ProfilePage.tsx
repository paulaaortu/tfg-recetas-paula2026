import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut, ChevronRight, Settings, Shield, Bell } from 'lucide-react'
import Header from '../components/Header'
import Menu from '../components/Menu'
import './ProfilePage.css'

function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'>('perfil')
    const [userName, setUserName] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            navigate('/login')
            return
        }

        try {
            const user = JSON.parse(storedUser)
            setUserName(user.username)
            setEmail(user.email)
        } catch (e) {
            console.error('Error parsing user data:', e)
            navigate('/login')
        }
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as any)
        if (tab === 'inicio') navigate('/')
        if (tab === 'social') navigate('/social')
    }

    return (
        <div className="profile-page-container">
            <Header />

            <div className="profile-content">
                <div className="profile-header-section">
                    <div className="profile-avatar-large">
                        <User size={40} />
                    </div>
                    <h1 className="profile-name">{userName}</h1>
                    <p className="profile-email">{email}</p>
                </div>

                <div className="profile-menu-groups">
                    <div className="profile-menu-group">
                        <h2 className="group-title">Cuenta</h2>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <User size={20} className="menu-icon" />
                                <span>Editar Perfil</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <Mail size={20} className="menu-icon" />
                                <span>Cambiar Email</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                    </div>

                    <div className="profile-menu-group">
                        <h2 className="group-title">Ajustes</h2>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <Bell size={20} className="menu-icon" />
                                <span>Notificaciones</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <Shield size={20} className="menu-icon" />
                                <span>Privacidad y Seguridad</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <Settings size={20} className="menu-icon" />
                                <span>Preferencias</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                    </div>

                    <div className="profile-menu-group">
                        <div className="menu-item logout-item" onClick={handleLogout}>
                            <div className="menu-item-left">
                                <LogOut size={20} className="logout-icon" />
                                <span>Cerrar Sesión</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Menu
                activeTab={activeTab}
                onChange={handleTabChange}
                userName={userName || 'Invitado'}
                pantryCount={0}
                onViewRecipes={() => navigate('/')}
            />
        </div>
    )
}

export default ProfilePage
