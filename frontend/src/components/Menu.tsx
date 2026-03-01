// src/components/BottomNav.tsx
import React from 'react'

type Tab = 'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'

const TABS: { id: Tab; label: string; icon: React.ReactElement }[] = [
    {
        id: 'inicio',
        label: 'Inicio',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
        ),
    },
    {
        id: 'buscar',
        label: 'Buscar',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    },
    {
        id: 'despensa',
        label: 'Despensa',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
        ),
    },
    {
        id: 'social',
        label: 'Social',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        id: 'perfil',
        label: 'Perfil',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
]

interface BottomNavProps {
    activeTab: Tab
    onChange?: (tab: Tab) => void
    userName: string
    pantryCount: number
    onViewRecipes: () => void
}

export default function BottomNav({
    activeTab,
    onChange,
    userName,
    pantryCount,
    onViewRecipes
}: BottomNavProps) {
    const handleClick = (tab: Tab) => {
        onChange?.(tab)
    }

    return (
        <nav className="bottom-nav">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'nav-item--active' : ''}`}
                    onClick={() => handleClick(tab.id)}
                >
                    <div className="nav-icon-container">
                        {tab.icon}
                    </div>
                    <span className="nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    )
}