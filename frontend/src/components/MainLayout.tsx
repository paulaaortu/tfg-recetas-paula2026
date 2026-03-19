import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import Header from './Header';
import Menu from './Menu';
import type { Tab } from './Menu';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const getActiveTab = (): Tab => {
        const path = location.pathname;
        if (path === '/') return 'inicio';
        if (path === '/buscar') return 'buscar';
        if (path === '/despensa') return 'despensa';
        if (path === '/social') return 'social';
        if (path === '/perfil' || path === '/login' || path === '/register') return 'perfil';
        if (path.startsWith('/recipe/')) return 'inicio';
        return 'inicio';
    };

    const handleTabChange = (tab: Tab) => {
        if (tab === 'inicio') navigate('/');
        if (tab === 'buscar') navigate('/buscar');
        if (tab === 'despensa') navigate('/despensa');
        if (tab === 'social') navigate('/social');
        if (tab === 'perfil') {
            const hasSession = localStorage.getItem('user');
            navigate(hasSession ? '/perfil' : '/login');
        }
    };

    const activeTab = getActiveTab();

    return (
        <>
            <Header activeTab={activeTab} onTabChange={handleTabChange} />
            <main style={{ paddingTop: '70px' }}>
                <Outlet />
            </main>
            <Menu activeTab={activeTab} onChange={handleTabChange} />
        </>
    );
};

export default MainLayout;
