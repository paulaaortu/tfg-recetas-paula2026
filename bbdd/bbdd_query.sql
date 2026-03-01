-- =========================================
-- bbdd_query.sql
-- Script para limpiar y recrear la base de datos del TFG Recetas
-- =========================================

-- ==========================
-- BORRAR TABLAS SI EXISTEN
-- ==========================
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS user_sports CASCADE;
DROP TABLE IF EXISTS user_allergies CASCADE;
DROP TABLE IF EXISTS user_intolerances CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS allergies CASCADE;
DROP TABLE IF EXISTS intolerances CASCADE;

-- ==========================
-- CREAR TABLAS
-- ==========================

-- Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recetas
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    ingredients TEXT NOT NULL,
    steps TEXT NOT NULL,
    image_url TEXT,
    is_official BOOLEAN DEFAULT false,
    author_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

-- Deportes
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    goal_description TEXT
);

-- Relación usuario deportes
CREATE TABLE user_sports (
    user_id INTEGER NOT NULL,
    sport_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, sport_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE
);

-- ==========================
-- INSERTAR DATOS DE PRUEBA
-- ==========================

-- Usuarios
INSERT INTO users (username, email, password_hash)
VALUES
('paula', 'paula@email.com', 'hash_prueba1'),
('juan', 'juan@email.com', 'hash_prueba2');

-- Recetas oficiales
INSERT INTO recipes (title, description, ingredients, steps, image_url, is_official)
VALUES
('Tortilla de patatas', 'Receta tradicional española', 'Patatas, huevos, aceite, sal', 'Pelar patatas, freír, batir huevos, mezclar y cuajar', 'https://images.pexels.com/photos/14941246/pexels-photo-14941246.jpeg?_gl=1*i91e7c*_ga*MTExMTYzMjA2MC4xNzcyMzY2NTc3*_ga_8JE65Q40S6*czE3NzIzNjY1NzckbzEkZzEkdDE3NzIzNjY3MzgkajU2JGwwJGgw', true),
('Gazpacho', 'Sopa fría de tomate', 'Tomate, pepino, pimiento, aceite, vinagre, sal', 'Triturar todos los ingredientes y servir frío', 'https://plus.unsplash.com/premium_photo-1692781059201-d049a375a4d4?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', true);

-- Recetas de usuarios
INSERT INTO recipes (title, description, ingredients, steps, image_url, is_official, author_id)
VALUES
('Ensalada de quinoa', 'Receta saludable', 'Quinoa, tomate, pepino, limón', 'Cocer quinoa, mezclar ingredientes, aliñar', 'https://images.pexels.com/photos/248509/pexels-photo-248509.jpeg?_gl=1*47kvg4*_ga*MTExMTYzMjA2MC4xNzcyMzY2NTc3*_ga_8JE65Q40S6*czE3NzIzNjY1NzckbzEkZzEkdDE3NzIzNjY4ODgkajMxJGwwJGgw', false, 1);

-- Favoritos
INSERT INTO favorites (user_id, recipe_id)
VALUES
(1, 2),  -- Paula marcó Gazpacho como favorito
(2, 1);  -- Juan marcó Tortilla de patatas como favorito


-- Alergias
INSERT INTO allergies (name)
VALUES
('Gluten'), ('Lácteos'), ('Frutos secos');

-- Intolerancias
INSERT INTO intolerances (name)
VALUES
('Fructosa'), ('Huevo'), ('Sodio');

-- Deportes
INSERT INTO sports (name, goal_description)
VALUES
('Musculación', 'Ganar masa muscular'),
('Running', 'Mejorar resistencia cardiovascular');

-- Usuario ↔ alergias
INSERT INTO user_allergies (user_id, allergy_id)
VALUES
(1, 1),  -- Paula es alérgica a Gluten
(2, 2);  -- Juan es alérgico a Lácteos

-- Usuario ↔ intolerancias
INSERT INTO user_intolerances (user_id, intolerance_id)
VALUES
(1, 2),  -- Paula intolerante a Huevo
(2, 3);  -- Juan intolerante a Sodio

-- Usuario ↔ deportes
INSERT INTO user_sports (user_id, sport_id)
VALUES
(1, 1),  -- Paula hace musculación
(2, 2);  -- Juan hace running
