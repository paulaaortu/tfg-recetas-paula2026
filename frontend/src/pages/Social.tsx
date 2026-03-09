import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Menu from '../components/Menu'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reuse Home styles for consistency

function Social() {
    const [activeTab, setActiveTab] = useState<'inicio' | 'buscar' | 'despensa' | 'social' | 'perfil'>('social')
    const [recipes, setRecipes] = useState<Recipe[]>([])
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
        <div className="contenedor-principal">
            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <div>
                <div className='bienvenida'>
                    <h1>Recetas de la comunidad</h1>
                </div>

                <section>
                    <div>
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
                />
            </div>
        </div>
    )
}

export default Social
