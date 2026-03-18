import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronRight, Settings, BookOpen, Heart, Loader2 } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal'
import { updateProfile } from '../services/authService'
import { RecipeService } from '../services/recipeService'
import CardRecipes from '../components/CardRecipes'
import type { Recipe } from '../types/recipes'
import './Profile.css'

function Profile() {
    const [userName, setUserName] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'ajustes' | 'misRecetas' | 'favoritas'>('ajustes')
    const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
    const [favorites, setFavorites] = useState<Recipe[]>([])
    const [loadingRecipes, setLoadingRecipes] = useState(false)
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

    useEffect(() => {
        if (activeTab === 'ajustes') return;
        const fetchRecipes = async () => {
            setLoadingRecipes(true);
            const service = new RecipeService();
            try {
                if (activeTab === 'misRecetas') {
                    const data = await service.getMyRecipes();
                    setMyRecipes(data);
                } else if (activeTab === 'favoritas') {
                    const data = await service.getFavorites();
                    setFavorites(data);
                }
            } catch (error) {
                console.error("Error cargando recetas:", error);
            } finally {
                setLoadingRecipes(false);
            }
        };
        fetchRecipes();
    }, [activeTab]);

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

    const user = userName && email && userId ? { id: userId, username: userName, email: email } : null;

    if (!user) return null;

    return (
        <div className="contenedor-perfil">
            <div className="perfil-contenido">
                <div className="cabezera">
                    <div>
                        <User size={40} />
                    </div>
                    <h1>{userName}</h1>
                    <p>{email}</p>
                </div>
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'ajustes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ajustes')}
                    >
                        <Settings size={20} /> Ajustes
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'misRecetas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('misRecetas')}
                    >
                        <BookOpen size={20} /> Mis Recetas
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'favoritas' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favoritas')}
                    >
                        <Heart size={20} /> Favoritas
                    </button>
                </div>

                {activeTab === 'ajustes' && (
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
                )}

                {activeTab !== 'ajustes' && (
                    <div className="recipes-tab-content">
                        {loadingRecipes ? (
                            <div className="loading-contenedor">
                                <Loader2 className="animate-spin" size={40} />
                                <p>Cargando recetas...</p>
                            </div>
                        ) : (
                            <div className="grid-recetas">
                                {activeTab === 'misRecetas' && myRecipes.length === 0 && (
                                    <p className="no-recipes-msg">Aún no has subido ninguna receta.</p>
                                )}
                                {activeTab === 'favoritas' && favorites.length === 0 && (
                                    <p className="no-recipes-msg">Aún no tienes recetas favoritas.</p>
                                )}
                                
                                {activeTab === 'misRecetas' && myRecipes.map(recipe => (
                                    <CardRecipes key={recipe.id} recipe={recipe} />
                                ))}
                                {activeTab === 'favoritas' && favorites.map(recipe => (
                                    <CardRecipes key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

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

export default Profile
