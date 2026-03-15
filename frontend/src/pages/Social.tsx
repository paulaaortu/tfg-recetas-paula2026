import { useEffect, useState } from 'react'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import { useNavigate } from 'react-router-dom'
import './Home.css' // Reuse Home styles for consistency
import './Social.css'

function Social() {
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
                //solo recetas de usuarios
                const data = await recipeService.getAllRecipes(false)
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas sociales:', error)
            }
        }
        fetchRecipes()
    }, [navigate])

    return (
        <div className="contenedor-principal">
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

                <button
                    className="fab-add-recipe"
                    onClick={() => navigate('/upload')}
                    title="Añadir receta"
                >
                    +
                </button>
            </div>
        </div>
    )
}

export default Social
