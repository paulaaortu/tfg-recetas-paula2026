import { useEffect, useState } from 'react'
import Header from '../components/Header'
import Menu from '../components/Menu'
import CardRecipes from '../components/CardRecipes'
import { RecipeService } from '../services/recipeService'
import type { Recipe } from '../types/recipes'
import './Home.css'

function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const recipeService = new RecipeService()

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const data = await recipeService.getAllRecipes()
                setRecipes(data)
            } catch (error) {
                console.error('Error al cargar recetas:', error)
            }
        }
        fetchRecipes()
    }, [])

    return (
        <div className="home-wrapper">
            <div className="home-container">
                <Header
                    userName="Paula"
                    pantryCount={16}
                    onViewRecipes={() => console.log('Ver recetas')}
                />

                <section className="recommendations">
                    <div className="title-row">
                        <h2>Recomendaciones para ti</h2>
                        <span className="see-all">Ver todas</span>
                    </div>

                    <div className="recipes-grid">
                        {recipes.map((recipe) => (
                            <CardRecipes key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                </section>

                <Menu
                    userName="Paula"
                    pantryCount={16}
                    onViewRecipes={() => console.log('Ver recetas')}
                    onChange={(tab) => console.log('Tab:', tab)}
                />
            </div>
        </div>
    )
}

export default Home;