import { Clock } from "lucide-react";
import type { Recipe } from "../types/recipes";
import { useNavigate } from "react-router-dom";

interface Props {
    recipe: Recipe;
}

export default function CardRecipes({ recipe }: Props) {
    const navigate = useNavigate();

    return (
        <div className="recipe-card" onClick={() => navigate(`/recipe/${recipe.id}`)} style={{ cursor: 'pointer' }}>
            <img src={recipe.image_url} alt={recipe.title} />

            <div>
                <h3>{recipe.title}</h3>
                <span>{recipe.description}</span>
                <span> <Clock className="clock-icon"></Clock> {recipe.time} min</span>
            </div>
        </div>
    );
}