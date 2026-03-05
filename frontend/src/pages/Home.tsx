import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import PantryCard from '../components/PantryCard'
import Menu from '../components/Menu'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'>('inicio')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const recipeService = new RecipeService()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await recipeService.getAllRecipes(true)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas:', error)
            }
        }
        fetchRecipes()

        // Get user from localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser)
                setUserName(user.username)
            } catch (e) {
                console.error('Error parsing user from localStorage', e)
            }
        }
    }, [])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as any)
        if (tab === 'social') navigate('/social')
        if (tab === 'inicio') navigate('/')
        if (tab === 'perfil') {
            const hasSession = localStorage.getItem('user')
            navigate(hasSession ? '/perfil' : '/login')
        }
    }

    return (
        <div className="home-container">
            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <div className="content">
                <div className="greeting">
                    <h1>
                        {userName ? `Hola, ` : 'Bienvenido'}
                        <span className="name-underline">{userName}</span>
                    </h1>
                    <p className="subtitle">¿Qué cocinamos hoy?</p>
                </div>

                {/* Barra búsqueda desktop */}
                <div className="search-bar">
                    <input placeholder="Busca una receta, ingrediente o categoría..." />
                    <button>Buscar</button>
                </div>

                <div className="desktop-layout">

                    <div className="main-column">

                        {userName && (
                            <PantryCard
                                pantryCount={16}
                                onViewRecipes={() => console.log('Ver recetas')}
                            />
                        )}

                        <section className="recommendations">
                            <div className="title-row">
                                <h2>{userName ? 'Recomendaciones para ti' : 'Nuestras Recetas'}</h2>
                                <span className="see-all">Ver todas</span>
                            </div>

                            <div className="recipes-grid">
                                {recipes.map((recipe) => (
                                    <CardRecipes key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* SIDEBAR */}
                    <aside className="sidebar">

                        <div className="sidebar-section">
                            <h3>🔥 En tendencia</h3>
                            <ul>
                                <li>Gazpacho andaluz</li>
                                <li>Tortilla española</li>
                                <li>Paella valenciana</li>
                                <li>Croquetas caseras</li>
                            </ul>
                        </div>

                        <div className="sidebar-section">
                            <h3>🕓 Vistas recientemente</h3>
                            <ul>
                                <li>Sopa de zanahoria</li>
                                <li>Tarta de limón</li>
                                <li>Salteado de verduras</li>
                            </ul>
                        </div>

                    </aside>

                </div>

                <Menu
                    activeTab={activeTab}
                    onChange={handleTabChange}
                />

            </div>
        </div>
    )
}

export default Home;