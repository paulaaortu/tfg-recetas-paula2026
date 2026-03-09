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

        //usuario de localStorage
        const usuario = localStorage.getItem('user')
        if (usuario) {
            try {
                const user = JSON.parse(usuario)
                setUserName(user.username)
            } catch (error) {
                console.error('Error cargando usuario de localStorage', error)
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
        <div className="contenedor-principal">
            <Header
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            <div>
                <div className="bienvenida">
                    <h1 className="name-underline">
                        {userName ? `Hola, ` : 'Bienvenido'}
                        <span>{userName}</span>
                    </h1>
                    <p className="subtitulo">¿Qué cocinamos hoy?</p>
                </div>

                {/* Barra búsqueda desktop */}
                <div className="barra-busqueda">
                    <input placeholder="Busca una receta, ingrediente o categoría..." />
                    <button>Buscar</button>
                </div>

                <div className="ordenador">
                    <div>
                        {userName && (
                            <PantryCard
                                pantryCount={16}
                                onViewRecipes={() => console.log('Ver recetas')}
                            />
                        )}

                        <section>
                            <div className="titulo">
                                <h2>{userName ? 'Recomendaciones' : 'Nuestras Recetas'}</h2>
                                <span className="see-all">Ver todas</span>
                            </div>

                            <div className="grid-recetas">
                                {recipes.map((recipe) => (
                                    <CardRecipes key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        </section>
                    </div>
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