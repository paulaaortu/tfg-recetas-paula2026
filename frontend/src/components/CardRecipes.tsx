import type { Recipe } from "../types/recipes";

interface Props {
    recipe: Recipe;
}

export default function CardRecipes({ recipe }: Props) {
    return (
        <div className="recipe-card">
            <img src={recipe.image_url} alt={recipe.title} />

            <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <span>{recipe.description}</span>
            </div>
        </div>
    );
}