-- ==========================
-- BORRAR TABLAS SI EXISTEN
-- ==========================
DROP TABLE IF EXISTS pantry CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS user_sports CASCADE;
DROP TABLE IF EXISTS user_allergies CASCADE;
DROP TABLE IF EXISTS user_intolerances CASCADE;
DROP TABLE IF EXISTS user_objectives CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS allergies CASCADE;
DROP TABLE IF EXISTS intolerances CASCADE;
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

-- Alergias
CREATE TABLE allergies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Intolerancias
CREATE TABLE intolerances (
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

-- Relación usuario intolerancias
CREATE TABLE user_intolerances (
    user_id INTEGER NOT NULL,
    intolerance_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, intolerance_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (intolerance_id) REFERENCES intolerances(id) ON DELETE CASCADE
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
-- INSERTAR DATOS DE PRUEBA
-- ==========================

-- Usuarios
INSERT INTO users (username, email, password_hash, is_admin)
VALUES
('paula', 'paula@email.com', 'hash_prueba1', false),
('juan', 'juan@email.com', 'hash_prueba2', false),
('admin', 'admin@email.com', '$2b$10$9v3X9S8K1i5oQ1gL2m8R7O3n7U4e.Iq3G.o/h6a/Y3P2J5l1G', true); -- password is 'admin123'

-- Categorías
INSERT INTO categories (name)
VALUES
('Carnes'), ('Pescados'), ('Verduras'), ('Postres'), ('Desayunos'), ('Otros');

-- Recetas oficiales
INSERT INTO recipes (title, description, difficulty, allergens, time, calories, ingredients, steps, image_url, is_official, category_id)
VALUES
('Tortilla de patatas', 'Receta tradicional española', 'Media', 'Huevo', 25, 350, 'Patatas, huevos, aceite, sal', 'Pelar patatas, freír, batir huevos, mezclar y cuajar', 'https://images.pexels.com/photos/14941246/pexels-photo-14941246.jpeg?_gl=1*i91e7c*_ga*MTExMTYzMjA2MC4xNzcyMzY2NTc3*_ga_8JE65Q40S6*czE3NzIzNjY1NzckbzEkZzEkdDE3NzIzNjY3MzgkajU2JGwwJGgw', true, 6),
('Gazpacho', 'Sopa fría de tomate, muy refrescante y baja en calorías', 'Fácil', 'Ninguno', 30, 120, 'Tomate, pepino, pimiento, aceite, vinagre, sal', 'Triturar todos los ingredientes y servir frío', 'https://plus.unsplash.com/premium_photo-1692781059201-d049a375a4d4?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true, 3),
('Ensalada de pollo', 'Ensalada proteica baja en calorías, ideal para adelgazar', 'Fácil', 'Ninguno', 20, 280, 'Pollo a la plancha, lechuga, tomate cherry, pepino, limón, aceite', 'Cocinar el pollo, cortar en tiras, mezclar con la verdura y aliñar', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true, 3),
('Pasta carbonara', 'Receta italiana con nata y bacon', 'Media', 'Gluten, Lácteos, Huevo', 30, 620, 'Pasta, nata, bacon, huevo, queso parmesano, pimienta', 'Cocer la pasta, preparar la salsa carbonara con huevo y nata, juntar todo', 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', true, 1),
('Smoothie de frutas', 'Batido saludable y bajo en calorías', 'Fácil', 'Ninguno', 5, 150, 'Plátano, fresas, naranja, agua', 'Triturar todos los ingredientes hasta obtener una bebida suave', 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg', true, 5);

-- Recetas de usuarios
INSERT INTO recipes (title, description, difficulty, allergens, time, calories, ingredients, steps, image_url, is_official, author_id, category_id)
VALUES
('Ensalada de quinoa', 'Receta saludable y nutritiva', 'Fácil', 'Ninguno', 15, 310, 'Quinoa, tomate, pepino, limón', 'Cocer quinoa, mezclar ingredientes, aliñar', 'https://images.pexels.com/photos/248509/pexels-photo-248509.jpeg?_gl=1*47kvg4*_ga*MTExMTYzMjA2MC4xNzcyMzY2NTc3*_ga_8JE65Q40S6*czE3NzIzNjY1NzckbzEkZzEkdDE3NzIzNjY4ODgkajMxJGwwJGgw', false, 1, 3);

-- Favoritos
INSERT INTO favorites (user_id, recipe_id)
VALUES
(1, 2),
(2, 1);

-- Alergias
INSERT INTO allergies (name)
VALUES
('Gluten'), ('Lactosa'), ('Frutos secos'), ('Mariscos'), ('Soja'), ('Sésamo'), ('Huevo'), ('Fructosa');

-- Intolerancias
INSERT INTO intolerances (name)
VALUES
('Lactosa'), ('Fructosa'), ('Huevo'), ('Gluten'), ('Sodio');

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

-- Usuario -> intolerancias
INSERT INTO user_intolerances (user_id, intolerance_id)
VALUES
(1, 3),
(2, 1);

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
