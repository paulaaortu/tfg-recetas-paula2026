import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, CheckCircle } from 'lucide-react';
import { RecipeService } from '../services/recipeService';
import './Upload.css';

export default function Upload() {
    const navigate = useNavigate();
    const recipeService = new RecipeService();

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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
    const [availableCategories, setAvailableCategories] = useState<{ id: number, name: string }[]>([]);
    const [availableAllergens, setAvailableAllergens] = useState<string[]>([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesData, allergensData] = await Promise.all([
                    recipeService.getCategories(),
                    recipeService.getAllAllergens()
                ]);
                setAvailableCategories(categoriesData);
                setAvailableAllergens(allergensData.map((a: any) => a.name)); // Assuming the UI expects an array of strings
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            }
        };
        fetchData();
    }, []);

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

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('difficulty', difficulty);
        formData.append('allergens', allergens.length > 0 ? allergens.join(', ') : 'Ninguno');
        formData.append('time', timeNum.toString());
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

            setShowSuccessPopup(true);
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
                    <button className="close-btn" onClick={() => navigate(-1)}>
                        <X size={24} />
                    </button>
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

                {/* Descripción Corta */}
                <div className="form-group">
                    <label>DESCRIPCIÓN CORTA</label>
                    <input 
                        type="text" 
                        placeholder="Una frase sobre tu receta..." 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Info row */}
                <div className="form-row">
                    <div className="form-group half">
                        <label>TIEMPO</label>
                        <div className="input-with-icon">
                            <Clock size={18} className="icon" />
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
                                    {ing} <X size={14} style={{ marginLeft: '4px' }} />
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

                <button 
                    className="submit-recipe-btn" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Publicando...' : 'Publicar receta'}
                </button>

            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="success-popup-overlay">
                    <div className="success-popup-content">
                        <CheckCircle size={50} className="success-popup-icon" />
                        <h3>¡Receta publicada!</h3>
                        <p>Tu receta se ha publicado con éxito.</p>
                        <button 
                            className="success-popup-btn" 
                            onClick={() => navigate('/social')}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
