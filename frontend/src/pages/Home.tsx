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
        if (tab === 'perfil') navigate('/login')
    }

    return (
        <div className="home-container">
            <Header />
            <div className="content">
                <div className="greeting">
                    <h1>{userName ? `Hola, ` : 'Bienvenido'} <span className="name-underline">{userName}</span></h1>
                    <p className="subtitle">¿Qué cocinamos hoy?</p>
                </div>

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

                <Menu
                    activeTab={activeTab}
                    onChange={handleTabChange}
                    userName={userName || 'Invitado'}
                    pantryCount={16}
                    onViewRecipes={() => console.log('Ver recetas')}
                />
            </div>
        </div>
    )
}

export default Home;