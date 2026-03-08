import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import Menu from '../components/Menu'
import EditProfileModal from '../components/EditProfileModal'
import { updateProfile } from '../services/authService'
import './ProfilePage.css'

function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'>('perfil')
    const [userName, setUserName] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const usuarioLocal = localStorage.getItem('user')
        if (!usuarioLocal) {
            navigate('/login')
            return
        }

        try {
            const user = JSON.parse(usuarioLocal)
            setUserName(user.username)
            setEmail(user.email)
            setUserId(user.id)
        } catch (error) {
            console.error('Error cogiendo los datos del usuario:', error)
            navigate('/login')
        }
    }, [navigate])

    const handleSaveProfile = async (updatedData: { username: string; email: string; password?: string }) => {
        if (!userId) return;

        const result = await updateProfile(userId, updatedData.username, updatedData.email, updatedData.password);

        //actualizar estado local
        setUserName(result.user.username);
        setEmail(result.user.email);

        //actualizar localstorage
        const usuarioLocal = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...usuarioLocal, username: result.user.username, email: result.user.email };
        localStorage.setItem('user', JSON.stringify(newUser));
    };

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
        <div className="contenedor-perfil">
            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <div>
                <div className="cabezera">
                    <div>
                        <User size={40} />
                    </div>
                    <h1>{userName}</h1>
                    <p>{email}</p>
                </div>

                <div className="menu-perfil">
                    <div className="profile-menu-group">
                        <h2>Cuenta</h2>
                        <div className="menu-item" onClick={() => setIsEditModalOpen(true)}>
                            <div className="menu-item-left">
                                <User size={20} className="menu-icon" />
                                <span>Editar Perfil</span>
                            </div>
                            <ChevronRight size={18} className="chevron" />
                        </div>
                    </div>

                    <div className="profile-menu-group">
                        <h2>Preferencias</h2>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <span>Intolerancias</span>
                            </div>
                        </div>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <span>Objetivos</span>
                            </div>
                        </div>
                        <div className="menu-item">
                            <div className="menu-item-left">
                                <span>Deporte</span>
                            </div>
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
            />

            {userId && userName && email && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={{ id: userId, username: userName, email: email }}
                    onSave={handleSaveProfile}
                />
            )}
        </div>
    )
}

export default ProfilePage
