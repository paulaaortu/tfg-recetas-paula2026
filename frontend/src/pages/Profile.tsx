import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronRight, Settings, BookOpen, Heart, Loader2, ShieldAlert, Target, Dumbbell, Check, X } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal'
import { updateProfile } from '../services/authService'
import { RecipeService } from '../services/recipeService'
import { getUserPreferences, getPreferencesCatalog, saveUserPreferences } from '../services/profileService'
import type { UserPreferences, PreferencesCatalog } from '../services/profileService'
import CardRecipes from '../components/CardRecipes'
import type { Recipe } from '../types/recipes'
import AdminProfile from '../components/AdminProfile'
import './Profile.css'

type PreferenceType = 'objectives' | 'sports' | 'allergies';

function Profile() {
    const [userName, setUserName] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'ajustes' | 'misRecetas' | 'favoritas'>('ajustes')
    const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
    const [favorites, setFavorites] = useState<Recipe[]>([])
    const [loadingRecipes, setLoadingRecipes] = useState(false)

    // Estado de preferencias
    const [preferences, setPreferences] = useState<UserPreferences>({ objectives: [], sports: [], allergies: [] })
    const [catalog, setCatalog] = useState<PreferencesCatalog>({ objectives: [], sports: [], allergies: [] })
    const [openModal, setOpenModal] = useState<PreferenceType | null>(null)
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [savingPrefs, setSavingPrefs] = useState(false)

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
            setAvatarUrl(user.avatar_url || null)
            setIsAdmin(user.is_admin || false)
        } catch (error) {
            console.error('Error cogiendo los datos del usuario:', error)
            navigate('/login')
        }
    }, [navigate])

    useEffect(() => {
        // Cargar catálogo y preferencias del usuario
        const loadPreferences = async () => {
            try {
                const [cat, prefs] = await Promise.all([
                    getPreferencesCatalog(),
                    getUserPreferences(),
                ])
                setCatalog(cat)
                setPreferences(prefs)
            } catch (err) {
                console.error('Error cargando preferencias:', err)
            }
        }
        loadPreferences()
    }, [])

    useEffect(() => {
        if (openModal || isEditModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [openModal, isEditModalOpen]);

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

    const handleSaveProfile = async (updatedData: { username: string; email: string; password?: string; avatar_url?: string }) => {
        if (!userId) return;

        const result = await updateProfile(userId, updatedData.username, updatedData.email, updatedData.password, updatedData.avatar_url);

        setUserName(result.user.username);
        setEmail(result.user.email);
        setAvatarUrl(result.user.avatar_url);

        const usuarioLocal = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...usuarioLocal, username: result.user.username, email: result.user.email, avatar_url: result.user.avatar_url };
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    const openPreferenceModal = (type: PreferenceType) => {
        let currentIds: number[] = [];
        if (type === 'objectives') currentIds = preferences.objectives.map(o => o.id);
        if (type === 'sports') currentIds = preferences.sports.map(s => s.id);
        if (type === 'allergies') currentIds = (preferences.allergies || []).map(a => a.id);
        setSelectedIds(currentIds);
        setOpenModal(type);
    }

    const toggleId = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    const handleSavePreferences = async () => {
        setSavingPrefs(true);
        try {
            const payload = {
                objective_ids: openModal === 'objectives' ? selectedIds : preferences.objectives.map(o => o.id),
                sport_ids: openModal === 'sports' ? selectedIds : preferences.sports.map(s => s.id),
                allergy_ids: openModal === 'allergies' ? selectedIds : (preferences.allergies || []).map(a => a.id),
            };
            const updated = await saveUserPreferences(payload);
            setPreferences(updated);
            setOpenModal(null);
        } catch (err) {
            console.error('Error guardando preferencias:', err);
        } finally {
            setSavingPrefs(false);
        }
    }

    const getModalOptions = () => {
        if (openModal === 'objectives') return catalog.objectives;
        if (openModal === 'sports') return catalog.sports;
        if (openModal === 'allergies') return catalog.allergies;
        return [];
    }

    const getModalTitle = () => {
        if (openModal === 'objectives') return 'Selecciona tus objetivos';
        if (openModal === 'sports') return 'Selecciona tus deportes';
        if (openModal === 'allergies') return 'Selecciona tus alergias';
        return '';
    }

    const user = userName && email && userId ? { id: userId, username: userName, email: email, avatar_url: avatarUrl || undefined } : null;
    
    if (!user) {
        return (
            <div className="contenedor-perfil">
                <div className="loading-contenedor">
                    <Loader2 className="animate-spin" size={40} />
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (isAdmin) {
        return <AdminProfile />;
    }

    return (
        <div className="contenedor-perfil">
            <div className={`perfil-contenido ${activeTab !== 'ajustes' ? 'wide' : ''}`}>
                <div className="cabezera">
                    <div className="avatar-header">
                        {avatarUrl ? (
                            <img src={`http://localhost:3001${avatarUrl}`} alt="Profile Avatar" className="profile-avatar-img" />
                        ) : (
                            <User size={40} />
                        )}
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

                            {/* ALERGIAS */}
                            <div className="menu-item" onClick={() => openPreferenceModal('allergies')}>
                                <div className="menu-item-left">
                                    <ShieldAlert size={20} className="menu-icon" color="#f87171" />
                                    <div>
                                        <span>Alergias e Intolerancias</span>
                                        {preferences.allergies && preferences.allergies.length > 0 && (
                                            <div className="preference-chips">
                                                {preferences.allergies.map(a => (
                                                    <span key={a.id} className="pref-chip">{a.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={18} className="chevron" />
                            </div>

                            {/* OBJETIVOS */}
                            <div className="menu-item" onClick={() => openPreferenceModal('objectives')}>
                                <div className="menu-item-left">
                                    <Target size={20} className="menu-icon" />
                                    <div>
                                        <span>Objetivos</span>
                                        {preferences.objectives.length > 0 && (
                                            <div className="preference-chips">
                                                {preferences.objectives.map(o => (
                                                    <span key={o.id} className="pref-chip">{o.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={18} className="chevron" />
                            </div>

                            {/* DEPORTE */}
                            <div className="menu-item" onClick={() => openPreferenceModal('sports')}>
                                <div className="menu-item-left">
                                    <Dumbbell size={20} className="menu-icon" />
                                    <div>
                                        <span>Deporte</span>
                                        {preferences.sports.length > 0 && (
                                            <div className="preference-chips">
                                                {preferences.sports.map(s => (
                                                    <span key={s.id} className="pref-chip">{s.name}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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

            {/* EDIT PROFILE MODAL */}
            {userId && userName && email && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    user={{ id: userId, username: userName, email: email }}
                    onSave={handleSaveProfile}
                />
            )}

            {/* PREFERENCE PICKER MODAL */}
            {openModal && (
                <div className="modal-overlay" onClick={() => setOpenModal(null)}>
                    <div className="modal-preference" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-preference-header">
                            <h3>{getModalTitle()}</h3>
                            <button className="modal-close-btn" onClick={() => setOpenModal(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-preference-options">
                            {getModalOptions().map((option) => {
                                const isSelected = selectedIds.includes(option.id);
                                return (
                                    <div
                                        key={option.id}
                                        className={`preference-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleId(option.id)}
                                    >
                                        <div className="preference-option-check">
                                            {isSelected && <Check size={16} />}
                                        </div>
                                        <div className="preference-option-text">
                                            <span className="preference-option-name">{option.name}</span>
                                            {('description' in option && (option as any).description) ? (
                                                <small className="preference-option-desc">{(option as any).description}</small>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="modal-preference-footer">
                            <button className="btn-cancel" onClick={() => setOpenModal(null)}>Cancelar</button>
                            <button
                                className="btn-save"
                                onClick={handleSavePreferences}
                                disabled={savingPrefs}
                            >
                                {savingPrefs ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profile
