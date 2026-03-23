import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, Plus, Trash2, Edit } from 'lucide-react';
import * as adminService from '../services/adminService';
import type { Recipe } from '../types/recipes';
import ConfirmModal from './ConfirmModal';
import './AdminProfile.css';

interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}

const AdminProfile: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'official' | 'user_recipes'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [officialRecipes, setOfficialRecipes] = useState<Recipe[]>([]);
    const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        isDanger: false
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        // Limpiamos los estados para evitar mostrar datos antiguos al cambiar de pestaña
        setUsers([]);
        setOfficialRecipes([]);
        setUserRecipes([]);
        
        try {
            if (activeTab === 'users') {
                const data = await adminService.getAllUsers();
                setUsers(data);
            } else if (activeTab === 'official') {
                const data = await adminService.getAdminRecipes('official');
                setOfficialRecipes(data);
            } else if (activeTab === 'user_recipes') {
                const data = await adminService.getAdminRecipes('user');
                setUserRecipes(data);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar usuario',
            message: '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await adminService.deleteUser(id);
                    setUsers(users.filter(u => u.id !== id));
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    alert('Error al eliminar usuario');
                }
            }
        });
    };

    const handleDeleteRecipe = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Eliminar receta',
            message: '¿Estás seguro de que quieres eliminar esta receta? Esta acción no se puede deshacer.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await adminService.deleteRecipe(id);
                    if (activeTab === 'official') {
                        setOfficialRecipes(officialRecipes.filter(r => r.id !== id));
                    } else {
                        setUserRecipes(userRecipes.filter(r => r.id !== id));
                    }
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    alert('Error al eliminar receta');
                }
            }
        });
    };

    return (
        <div className="admin-dashboard">
            <nav className="admin-nav-tabs">
                <button 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={20} /> Usuarios
                </button>
                <button 
                    className={activeTab === 'official' ? 'active' : ''} 
                    onClick={() => setActiveTab('official')}
                >
                    <BookOpen size={20} /> Oficiales
                </button>
                <button 
                    className={activeTab === 'user_recipes' ? 'active' : ''} 
                    onClick={() => setActiveTab('user_recipes')}
                >
                    <FileText size={20} /> Recetas Usuarios
                </button>
            </nav>

            <main className="admin-content">
                <div className="content-header">
                    <h1>{activeTab === 'users' ? 'Gestión de Usuarios' : activeTab === 'official' ? 'Recetas Oficiales' : 'Recetas de Usuarios'}</h1>
                    {activeTab === 'official' && (
                        <button className="btn-add-official" onClick={() => window.location.href = '/upload?official=true'}>
                            <Plus size={18} /> Nueva Receta Oficial
                        </button>
                    )}
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loader">Cargando datos del sistema...</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                {activeTab === 'users' ? (
                                    <tr>
                                        <th>ID</th>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Acciones</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>ID</th>
                                        <th>Título</th>
                                        <th>Dificultad</th>
                                        {activeTab === 'user_recipes' && <th>Autor</th>}
                                        <th>Acciones</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody>
                                {activeTab === 'users' && users.filter(user => !user.is_admin).map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="badge">Usuario</span>
                                        </td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDeleteUser(user.id)} title="Eliminar usuario">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab !== 'users' && (activeTab === 'official' ? officialRecipes : userRecipes).map(recipe => (
                                    <tr key={recipe.id}>
                                        <td>{recipe.id}</td>
                                        <td>{recipe.title}</td>
                                        <td>{recipe.difficulty}</td>
                                        {activeTab === 'user_recipes' && <td>{recipe.author_name}</td>}
                                        <td>
                                            <div className="action-btns">
                                                {activeTab === 'official' && (
                                                    <button className="btn-edit" onClick={() => window.location.href = `/upload?edit=${recipe.id}&official=true`} title="Editar receta">
                                                        <Edit size={16} />
                                                    </button>
                                                )}
                                                <button className="btn-delete" onClick={() => handleDeleteRecipe(recipe.id)} title="Eliminar receta">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <ConfirmModal 
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                confirmText="Eliminar"
            />
        </div>
    );
};

export default AdminProfile;
