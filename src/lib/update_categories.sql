-- 1. Ensure icon column exists
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Insert or update categories
INSERT INTO public.categories (slug, name, icon) VALUES
('electronics', 'Électronique', 'Smartphone'),
('home-furniture', 'Maison & Ameublement', 'Armchair'),
('vehicles', 'Véhicules & Transport', 'Car'),
('fashion', 'Mode & Chaussures', 'Shirt'),
('tools-equipment', 'Outils & Équipement', 'Hammer'),
('hobbies', 'Loisirs & Divertissement', 'Gamepad2'),
('animals', 'Animaux', 'PawPrint'),
('books', 'Livres & Études', 'BookOpen'),
('used-clearance', 'Occasions / Vide-grenier', 'Tag'),
('other', 'Autres', 'Package')
ON CONFLICT (slug) DO UPDATE SET
name = EXCLUDED.name,
icon = EXCLUDED.icon;
