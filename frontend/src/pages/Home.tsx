import { useEffect, useState } from 'react'
import PantryCard from '../components/PantryCard'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [userName, setUserName] = useState<string | null>(null)
    const recipeService = new RecipeService()

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

    return (
        <div className="contenedor-principal">
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
            </div>
        </div>
    )
}

export default Home;