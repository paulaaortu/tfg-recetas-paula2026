-- ==========================
-- BORRAR TABLAS SI EXISTEN
-- ==========================
DROP TABLE IF EXISTS pantry CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS user_sports CASCADE;
DROP TABLE IF EXISTS user_allergies CASCADE;
DROP TABLE IF EXISTS user_objectives CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS allergies CASCADE;
DROP TABLE IF EXISTS objectives CASCADE;

-- ==========================
-- CREAR TABLAS
-- ==========================

-- Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Recetas
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    difficulty VARCHAR(50),
    allergens TEXT,
    time INTEGER,
    calories INTEGER,
    ingredients TEXT NOT NULL,
    steps TEXT NOT NULL,
    image_url TEXT,
    is_official BOOLEAN DEFAULT false,
    category_id INTEGER,
    author_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_author
        FOREIGN KEY(author_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Favoritos
CREATE TABLE favorites (
    user_id INTEGER NOT NULL,
    recipe_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Alergias e Intolerancias (Unificadas)
CREATE TABLE allergies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Objetivos
CREATE TABLE objectives (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Deportes
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    goal_description TEXT
);

-- Relación usuario alergias
CREATE TABLE user_allergies (
    user_id INTEGER NOT NULL,
    allergy_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, allergy_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
);

-- Relación usuario objetivos
CREATE TABLE user_objectives (
    user_id INTEGER NOT NULL,
    objective_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, objective_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE
);

-- Relación usuario deportes
CREATE TABLE user_sports (
    user_id INTEGER NOT NULL,
    sport_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, sport_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- Despensa (Pantry)
CREATE TABLE pantry (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================
-- INSERTAR DATOS
-- ==========================

-- Usuarios
INSERT INTO users (username, email, password_hash, is_admin, avatar_url)
VALUES
('Paula', 'paula@gmail.com', '$2b$10$57j87qMGTkmFkrpitTSYQelYANvrNN3t86xDB8xmDcgPLO9B0IrRi', false, 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'),
('Juan', 'juan@gmail.com', '$2b$10$57j87qMGTkmFkrpitTSYQelYANvrNN3t86xDB8xmDcgPLO9B0IrRi', false, 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'),
('Administrador', 'admin@gmail.com', '$2b$10$57j87qMGTkmFkrpitTSYQelYANvrNN3t86xDB8xmDcgPLO9B0IrRi', true, 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg');

-- Categorías
INSERT INTO categories (name)
VALUES
('Carnes'), ('Pescados'), ('Verduras'), ('Postres'), ('Desayunos'), ('Otros');

-- Recetas oficiales
INSERT INTO recipes (title, description, difficulty, allergens, time, calories, ingredients, steps, image_url, is_official, category_id)
VALUES
('Tortilla de patatas', 'Receta tradicional española, jugosa y en su punto', 'Media', 'Huevo', 25, 350, 'Patatas, huevos, aceite de oliva virgen extra, sal', 'Pelar las patatas y cortarlas en láminas. Freírlas en aceite. Batir los huevos, mezclar con las patatas y cuajar en la sartén por ambos lados.', 'https://images.pexels.com/photos/14941246/pexels-photo-14941246.jpeg', true, 6),
('Gazpacho Andaluz', 'Sopa fría de tomate, muy refrescante y baja en calorías', 'Fácil', 'Ninguno', 30, 120, 'Tomate, pepino, pimiento, aceite, vinagre, sal', 'Triturar todos los ingredientes y servir bien frío.', 'https://plus.unsplash.com/premium_photo-1692781059201-d049a375a4d4', true, 3),
('Ensalada de pollo', 'Ensalada proteica baja en calorías, ideal para adelgazar', 'Fácil', 'Ninguno', 20, 280, 'Pollo a la plancha, lechuga, tomate cherry, pepino, limón, aceite', 'Cocinar el pollo, cortar en tiras, mezclar con la verdura y aliñar generosamente.', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true, 3),
('Pasta carbonara', 'Receta italiana clásica con nata y bacon', 'Media', 'Gluten, Lácteos, Huevo', 30, 620, 'Pasta, nata, bacon, huevo, queso parmesano, pimienta', 'Cocer la pasta. Preparar la salsa carbonara batiendo el huevo y la nata, juntar todo y remover rápido.', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', true, 1),
('Smoothie de Frutas', 'Batido saludable y muy energético', 'Fácil', 'Ninguno', 5, 150, 'Plátano, fresas, naranja, agua o leche', 'Triturar todos los ingredientes hasta obtener una bebida muy suave. Servir frío.', 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg', true, 5);

-- Recetas de usuarios
INSERT INTO recipes (title, description, difficulty, allergens, time, calories, ingredients, steps, image_url, is_official, author_id, category_id)
VALUES
('Ensalada de Quinoa y Aguacate', 'Receta saludable, nutritiva y con grasas buenas', 'Fácil', 'Ninguno', 15, 310, 'Quinoa, tomate, pepino, aguacate, limón', 'Cocer la quinoa y dejar enfriar. Cortar los vegetales y el aguacate. Mezclar todo y aliñar.', 'https://images.pexels.com/photos/248509/pexels-photo-248509.jpeg', false, 1, 3),
('Tacos de Pollo Suaves', 'Auténticos tacos con verduras, perfectos para compartir', 'Media', 'Ninguno', 40, 420, 'Pechuga de pollo, especias, tortillas de maíz, cilantro, cebolla, tomate', 'Marinar el pollo. Asarlo a la plancha. Servir sobre las tortillas calientes y añadir verduras picadas.', 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg', false, 1, 1),
('Tarta Dulce de Frutos', 'Postre rico y sabroso para una ocasión especial', 'Media', 'Lácteos, Huevo', 50, 320, 'Queso crema, huevos, azúcar, yogur natural, frutos rojos', 'Mezclar bien todos los ingredientes. Verter en un molde y hornear a 180º durante 40 min.', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg', false, 2, 4);

-- Favoritos
INSERT INTO favorites (user_id, recipe_id)
VALUES
(1, 2),
(2, 1);

-- Alergias e Intolerancias
INSERT INTO allergies (name)
VALUES
('Gluten'), ('Lactosa'), ('Frutos secos'), ('Mariscos'), ('Soja'), ('Sésamo'), ('Huevo'), ('Fructosa'), ('Sodio');

-- Objetivos
INSERT INTO objectives (name, description)
VALUES
('Adelgazar', 'Recetas bajas en calorías para perder peso'),
('Ganar masa muscular', 'Recetas ricas en proteínas para aumentar músculo'),
('Mantenimiento', 'Recetas equilibradas para mantener el peso'),
('Mejorar energía', 'Recetas nutritivas para mejorar el rendimiento deportivo'),
('Dieta saludable', 'Recetas equilibradas y naturales');

-- Deportes
INSERT INTO sports (name, goal_description)
VALUES
('Musculación', 'Ganar masa muscular'),
('Running', 'Mejorar resistencia cardiovascular'),
('Natación', 'Ejercicio completo de bajo impacto'),
('Ciclismo', 'Resistencia y fuerza en piernas'),
('Yoga', 'Flexibilidad y equilibrio'),
('Crossfit', 'Fuerza y resistencia funcional'),
('Ninguno', 'Sin deporte regular');

-- Usuario -> alergias
INSERT INTO user_allergies (user_id, allergy_id)
VALUES
(1, 1), 
(2, 2);

-- Usuario -> objetivos
INSERT INTO user_objectives (user_id, objective_id)
VALUES
(1, 2),
(2, 1);

-- Usuario -> deportes
INSERT INTO user_sports (user_id, sport_id)
VALUES
(1, 1),
(2, 2);

-- Datos de Despensa
INSERT INTO pantry (user_id, ingredient_name, quantity, unit)
VALUES
(1, 'Harina', 1.5, 'kg'),
(1, 'Huevos', 6.0, 'uds'),
(1, 'Leche', 2.0, 'L'),
(2, 'Pasta', 500.0, 'g'),
(2, 'Tomate frito', 1.0, 'bote');
