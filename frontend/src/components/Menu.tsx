import React from 'react'
import { Home, Search, Package, Users, User } from 'lucide-react'
import './Menu.css'

export type Tab = 'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'
export const TABS: { id: Tab; label: string; icon: React.ReactElement }[] = [
    {
        id: 'inicio',
        label: 'Inicio',
        icon: <Home size={20} />,
    },
    {
        id: 'buscar',
        label: 'Buscar',
        icon: <Search size={20} />,
    },
    {
        id: 'despensa',
        label: 'Despensa',
        icon: <Package size={20} />,
    },
    {
        id: 'social',
        label: 'Social',
        icon: <Users size={20} />,
    },
    {
        id: 'perfil',
        label: 'Perfil',
        icon: <User size={20} />,
    },
]

interface MenuProps {
    activeTab: Tab
    onChange?: (tab: Tab) => void
}

export default function Menu({ activeTab, onChange }: MenuProps) {
    const hasSession = localStorage.getItem('user');
    const user = hasSession ? JSON.parse(hasSession) : null;
    const isAdmin = user?.is_admin || false;

    const filteredTabs = TABS.filter(tab => !isAdmin || tab.id !== 'perfil');

    return (
        <nav className='menu-movil'>
            <div>
                {filteredTabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`nav-item nav-${tab.id} ${activeTab === tab.id ? 'nav-item--active' : ''}`}
                        onClick={() => onChange?.(tab.id)}
                    >
                        <div className="nav-icon-container">
                            {tab.icon}
                        </div>

                        <span>
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

        </nav>
    )
}