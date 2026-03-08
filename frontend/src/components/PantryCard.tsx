// src/components/PantryCard.tsx
import './PantryCard.css'

interface PantryCardProps {
    pantryCount: number
    onViewRecipes: () => void
}

export default function PantryCard({ pantryCount, onViewRecipes }: PantryCardProps) {
    return (
        <div className="btn-accion-home">
            <div>
                <p>Recetas con lo que tienes</p>
                <span>📦</span>
            </div>
            <p >Tienes {pantryCount} ingredientes en tu despensa</p>
            <button onClick={onViewRecipes}>
                Ver que puedo cocinar
            </button>
        </div>
    )
}
