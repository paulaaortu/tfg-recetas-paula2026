import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Menu from '../components/Menu'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reuse Home styles for consistency

function SocialPage() {
    const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'>('social')
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const recipeService = new RecipeService()
    const navigate = useNavigate()

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            navigate('/login')
            return
        }

        const fetchRecipes = async () => {
            try {
                // Fetch ONLY user recipes (official=false)
                const data = await recipeService.getAllRecipes(false)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas sociales:', error)
            }
        }
        fetchRecipes()

        try {
            const user = JSON.parse(storedUser)
            setUserName(user.username)
        } catch (e) {
            console.error('Error parsing user data:', e)
        }
    }, [navigate])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as any)
        if (tab === 'inicio') navigate('/')
        if (tab === 'perfil') {
            const hasSession = localStorage.getItem('user')
            navigate(hasSession ? '/perfil' : '/login')
        }
        if (tab === 'social') navigate('/social')
    }

    return (
        <div className="home-container">
            <Header />
            <div className="content">
                <div className="greeting">
                    <h1>Comunidad</h1>
                    <p className="subtitle">Descubre recetas de otros usuarios</p>
                </div>

                <section className="recommendations">
                    <div className="title-row">
                        <h2>Recetas de la comunidad</h2>
                    </div>

                    <div className="recipes-grid">
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <CardRecipes key={recipe.id} recipe={recipe} />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                Aún no hay recetas de la comunidad. ¡Sé el primero en compartir!
                            </p>
                        )}
                    </div>
                </section>

                <Menu
                    activeTab={activeTab}
                    onChange={handleTabChange}
                    userName={userName || 'Invitado'}
                    pantryCount={0}
                    onViewRecipes={() => navigate('/')}
                />
            </div>
        </div>
    )
}

export default SocialPage
