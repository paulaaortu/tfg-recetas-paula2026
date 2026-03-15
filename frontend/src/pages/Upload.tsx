import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeService } from '../services/recipeService';
import './Upload.css';

export default function Upload() {
    const navigate = useNavigate();
    const recipeService = new RecipeService();

    // Form states
    const [title, setTitle] = useState('');
    const [timeStr, setTimeStr] = useState('');
    const [difficulty, setDifficulty] = useState('Fácil');
    const [category, setCategory] = useState<number | null>(null);
    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [allergens, setAllergens] = useState<string[]>([]);
    const [steps, setSteps] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hardcoded categories mapping from DB loosely for UI sake
    const availableCategories = [
        { id: 1, name: 'Carnes' },
        { id: 2, name: 'Pescados' },
        { id: 3, name: 'Verduras' },
        { id: 4, name: 'Postres' },
        { id: 5, name: 'Desayunos' },
        { id: 6, name: 'Otros' }
    ];

    const availableAllergens = ['Gluten', 'Lácteos', 'Huevos', 'Frutos secos'];

    const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && ingredientInput.trim() !== '') {
            e.preventDefault();
            if (!ingredients.includes(ingredientInput.trim())) {
                setIngredients([...ingredients, ingredientInput.trim()]);
            }
            setIngredientInput('');
        }
    };

    const removeIngredient = (ingToRemove: string) => {
        setIngredients(ingredients.filter(ing => ing !== ingToRemove));
    };

    const toggleAllergen = (allergen: string) => {
        if (allergens.includes(allergen)) {
            setAllergens(allergens.filter(a => a !== allergen));
        } else {
            setAllergens([...allergens, allergen]);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !timeStr.trim() || !category || ingredients.length === 0 || !steps.trim()) {
            alert('Por favor, rellena todos los campos obligatorios (Nombre, Tiempo, Categoría, Ingredientes, Pasos).');
            return;
        }

        const timeMatches = timeStr.match(/\d+/);
        const timeNum = timeMatches ? parseInt(timeMatches[0], 10) : 0;

        // Compile description to include UI-only fields
        const formattedDescription = `Dificultad: ${difficulty}\nAlérgenos: ${allergens.length > 0 ? allergens.join(', ') : 'Ninguno'}`;

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('time', timeNum.toString());
        formData.append('description', formattedDescription);
        formData.append('ingredients', ingredients.join(', '));
        formData.append('steps', steps.trim());
        formData.append('category_id', category.toString());
        formData.append('is_official', 'false');
        if (imageFile) {
            formData.append('image', imageFile);
        }

        setIsSubmitting(true);
        try {
            await recipeService.createRecipe(formData);

            alert('¡Receta publicada con éxito!');
            navigate('/social');
        } catch (error: any) {
            console.error('Error al subir receta:', error);
            alert('Hubo un error al publicar la receta. Inténtalo de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="upload-container">
            {/* Header top section */}
            <div className="upload-header">
                
                {/* Photo placeholder */}
                <div 
                    className="photo-upload-area" 
                    style={{ 
                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '0 0 30px 30px'
                    }}
                >
                    {!imagePreview && (
                        <button className="photo-btn" onClick={triggerFileInput}>Toca para añadir foto</button>
                    )}
                    {imagePreview && (
                        <button className="photo-btn" onClick={triggerFileInput} style={{ opacity: 0.8 }}>Cambiar foto</button>
                    )}
                    <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleImageChange}
                    />
                </div>
            </div>

            {/* Form Sheet */}
            <div className="upload-form-sheet">
                
                {/* Nombre */}
                <div className="form-group">
                    <label>NOMBRE</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Lasaña de verduras..." 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* Info row */}
                <div className="form-row">
                    <div className="form-group half">
                        <label>TIEMPO</label>
                        <div className="input-with-icon">
                            <span className="icon">⏱️</span>
                            <input 
                                type="text" 
                                placeholder="30min" 
                                value={timeStr}
                                onChange={(e) => setTimeStr(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group half">
                        <label>DIFICULTAD</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="Fácil">Fácil</option>
                            <option value="Media">Media</option>
                            <option value="Difícil">Difícil</option>
                        </select>
                    </div>
                </div>

                {/* Categorías */}
                <div className="form-group">
                    <label>CATEGORÍAS</label>
                    <div className="pills-container">
                        {availableCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`pill ${category === cat.id ? 'active' : ''}`}
                                onClick={() => setCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ingredientes */}
                <div className="form-group">
                    <label>INGREDIENTES</label>
                    <input 
                        type="text" 
                        placeholder="Escribe y presiona Enter..." 
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={handleAddIngredient}
                        className="ingredient-input"
                    />
                    {ingredients.length > 0 && (
                        <div className="pills-container display-pills">
                            {ingredients.map((ing, idx) => (
                                <button key={idx} className="pill light-green" onClick={() => removeIngredient(ing)}>
                                    {ing} ✕
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alérgenos */}
                <div className="form-group">
                    <label>ALÉRGENOS</label>
                    <div className="pills-container">
                        {availableAllergens.map(allergen => (
                            <button
                                key={allergen}
                                className={`pill ${allergens.includes(allergen) ? 'active' : ''}`}
                                onClick={() => toggleAllergen(allergen)}
                            >
                                {allergen}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pasos */}
                <div className="form-group">
                    <label>Pasos</label>
                    <textarea 
                        placeholder="Explica la elaboración de la receta por pasos"
                        value={steps}
                        onChange={(e) => setSteps(e.target.value)}
                    ></textarea>
                </div>

                {/* Submit button */}
                <button 
                    className="submit-recipe-btn" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar receta'}
                </button>

            </div>
        </div>
    );
}
