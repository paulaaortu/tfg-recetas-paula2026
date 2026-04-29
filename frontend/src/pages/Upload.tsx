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
    const [calories, setCalories] = useState(''); // New field
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
    const [targetRecipeId, setTargetRecipeId] = useState<number | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [editId, setEditId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const idParam = params.get('edit');
                
                const [categoriesData, allergensData] = await Promise.all([
                    recipeService.getCategories(),
                    recipeService.getAllAllergens()
                ]);
                setAvailableCategories(categoriesData);
                setAvailableAllergens(allergensData.map((a: any) => a.name));

                if (idParam) {
                    const id = parseInt(idParam, 10);
                    setEditId(id);
                    const recipe = await recipeService.getRecipeById(id);
                    
                    setTitle(recipe.title);
                    setDescription(recipe.description || '');
                    setTimeStr(recipe.time !== undefined && recipe.time !== null ? `${recipe.time}min` : '');
                    setCalories(recipe.calories !== undefined && recipe.calories !== null ? recipe.calories.toString() : '');
                    setDifficulty(recipe.difficulty || 'Fácil');
                    setCategory(recipe.category_id);
                    setIngredients(recipe.ingredients ? recipe.ingredients.split(',').map((i: string) => i.trim()) : []);
                    setAllergens(recipe.allergens && recipe.allergens !== 'Ninguno' ? recipe.allergens.split(',').map((a: string) => a.trim()) : []);
                    setSteps(recipe.steps || '');
                    setImagePreview(recipe.image_url ? (recipe.image_url.startsWith('http') ? recipe.image_url : `http://localhost:3001${recipe.image_url}`) : null);
                }
            } catch (error) {
                console.error('Error al cargar datos iniciales:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (showSuccessPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showSuccessPopup]);

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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!title.trim()) newErrors.title = 'El nombre de la receta es obligatorio';
        if (!timeStr.trim()) {
            newErrors.time = 'El tiempo de preparación es obligatorio';
        } else if (isNaN(Number(timeStr.replace(/[^0-9]/g, '')))) {
            newErrors.time = 'Introduce un número válido';
        }
        if (!category) newErrors.category = 'Debes seleccionar una categoría';
        if (ingredients.length === 0) newErrors.ingredients = 'Añade al menos un ingrediente';
        if (!steps.trim()) newErrors.steps = 'Los pasos de preparación son obligatorios';
        if (calories && isNaN(Number(calories))) newErrors.calories = 'Introduce un número válido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        const timeNum = parseInt(timeStr.replace(/[^0-9]/g, ''), 10) || 0;

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('difficulty', difficulty);
        formData.append('allergens', allergens.length > 0 ? allergens.join(', ') : 'Ninguno');
        formData.append('time', timeNum.toString());
        if (calories !== '') {
            formData.append('calories', calories);
        }
        formData.append('steps', steps.trim());
        formData.append('ingredients', ingredients.join(', '));
        formData.append('category_id', category.toString());
        
        const params = new URLSearchParams(window.location.search);
        const isOfficialParam = params.get('official') === 'true';
        formData.append('is_official', isOfficialParam.toString());

        if (imageFile) {
            formData.append('image', imageFile);
        }

        setIsSubmitting(true);
        try {
            let response;
            if (editId) {
                response = await recipeService.updateRecipe(editId, formData);
            } else {
                response = await recipeService.createRecipe(formData);
            }

            if (response && response.id) {
                setTargetRecipeId(response.id);
            }
            setShowSuccessPopup(true);
        } catch (error: any) {
            console.error(editId ? 'Error al actualizar receta:' : 'Error al subir receta:', error);
            alert(editId ? 'Hubo un error al actualizar la receta.' : 'Hubo un error al publicar la receta. Inténtalo de nuevo.');
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
                    <label>NOMBRE <span className="required">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Ej: Lasaña de verduras..." 
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                        }}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
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
                        <label>TIEMPO (min) <span className="required">*</span></label>
                        <div className="input-with-icon">
                            <Clock size={18} className="icon" />
                            <input 
                                type="number" 
                                placeholder="30" 
                                value={timeStr.replace(/[^0-9]/g, '')}
                                onChange={(e) => {
                                    setTimeStr(e.target.value);
                                    if (errors.time) setErrors(prev => ({ ...prev, time: '' }));
                                }}
                                className={errors.time ? 'error' : ''}
                            />
                        </div>
                        {errors.time && <span className="error-message">{errors.time}</span>}
                    </div>
                    <div className="form-group half">
                        <label>CALORÍAS (Kcal)</label>
                        <input 
                            type="number" 
                            placeholder="Ej: 350" 
                            value={calories}
                            onChange={(e) => {
                                setCalories(e.target.value);
                                if (errors.calories) setErrors(prev => ({ ...prev, calories: '' }));
                            }}
                            className={errors.calories ? 'error' : ''}
                        />
                        {errors.calories && <span className="error-message">{errors.calories}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label>DIFICULTAD</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="Fácil">Fácil</option>
                        <option value="Media">Media</option>
                        <option value="Difícil">Difícil</option>
                    </select>
                </div>

                {/* Categorías */}
                <div className="form-group">
                    <label>CATEGORÍAS <span className="required">*</span></label>
                    <div className={`pills-container ${errors.category ? 'error-border' : ''}`}>
                        {availableCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`pill ${category === cat.id ? 'active' : ''}`}
                                onClick={() => {
                                    setCategory(cat.id);
                                    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                {/* Ingredientes */}
                <div className="form-group">
                    <label>INGREDIENTES <span className="required">*</span></label>
                    <input 
                        type="text" 
                        placeholder="Escribe y presiona Enter..." 
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyDown={(e) => {
                            handleAddIngredient(e);
                            if (errors.ingredients) setErrors(prev => ({ ...prev, ingredients: '' }));
                        }}
                        className={`ingredient-input ${errors.ingredients ? 'error' : ''}`}
                    />
                    {errors.ingredients && <span className="error-message">{errors.ingredients}</span>}
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
                    <label>PASOS <span className="required">*</span></label>
                    <textarea 
                        placeholder="Explica la elaboración de la receta por pasos"
                        value={steps}
                        onChange={(e) => {
                            setSteps(e.target.value);
                            if (errors.steps) setErrors(prev => ({ ...prev, steps: '' }));
                        }}
                        className={errors.steps ? 'error' : ''}
                    ></textarea>
                    {errors.steps && <span className="error-message">{errors.steps}</span>}
                </div>

                <button 
                    className="submit-recipe-btn" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (editId ? 'Guardando...' : 'Publicando...') : (editId ? 'Guardar cambios' : 'Publicar receta')}
                </button>

            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="success-popup-overlay">
                    <div className="success-popup-content">
                        <CheckCircle size={50} className="success-popup-icon" />
                        <h3>{editId ? '¡Cambios guardados!' : '¡Receta publicada!'}</h3>
                        <p>{editId ? 'La receta se ha actualizado con éxito.' : 'Tu receta se ha publicado con éxito.'}</p>
                        <button 
                            className="success-popup-btn" 
                            onClick={() => {
                                if (targetRecipeId) {
                                    navigate(`/recipe/${targetRecipeId}`);
                                } else {
                                    const params = new URLSearchParams(window.location.search);
                                    const isOfficial = params.get('official') === 'true';
                                    navigate(isOfficial ? '/' : '/social');
                                }
                            }}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
