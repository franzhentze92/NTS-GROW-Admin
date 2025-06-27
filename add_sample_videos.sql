-- Add sample video data for testing the G.R.O.W Video Library
-- Replace the youtube_video_id values with your actual YouTube video IDs

-- Clear existing sample data (optional)
-- DELETE FROM videos WHERE title LIKE '%Sample%';

-- Insert sample videos with different seasons, episodes, and languages
INSERT INTO videos (
    title, 
    description, 
    season, 
    episode, 
    language, 
    tags, 
    google_drive_file_id, 
    youtube_video_id,
    upload_status,
    upload_date,
    duration,
    thumbnail_url
) VALUES
-- Season 1 Videos
('Introduction to Soil Health - English', 'Learn the fundamentals of soil health and why it matters for sustainable agriculture. This comprehensive guide covers soil structure, organic matter, and biological activity.', 1, 1, 'English', ARRAY['soil health', 'basics', 'introduction', 'education', 'agriculture'], 'drive-file-1', 'dQw4w9WgXcQ', 'completed', '2024-01-15', '15:30', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Introduction to Soil Health - Spanish', 'Aprende los fundamentos de la salud del suelo y por qué es importante para la agricultura sostenible. Esta guía integral cubre la estructura del suelo, materia orgánica y actividad biológica.', 1, 1, 'Spanish', ARRAY['soil health', 'basics', 'introduction', 'education', 'agriculture', 'spanish'], 'drive-file-2', 'dQw4w9WgXcQ', 'completed', '2024-01-15', '15:30', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Microbial Products Overview - English', 'Understanding different types of microbial products and their applications in modern agriculture. Learn about beneficial bacteria, fungi, and their role in crop health.', 1, 2, 'English', ARRAY['microbial products', 'applications', 'overview', 'education', 'bacteria', 'fungi'], 'drive-file-3', 'dQw4w9WgXcQ', 'completed', '2024-01-22', '22:15', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Microbial Products Overview - Spanish', 'Comprensión de diferentes tipos de productos microbianos y sus aplicaciones en la agricultura moderna. Aprende sobre bacterias beneficiosas, hongos y su papel en la salud de los cultivos.', 1, 2, 'Spanish', ARRAY['microbial products', 'applications', 'overview', 'education', 'bacteria', 'fungi', 'spanish'], 'drive-file-4', 'dQw4w9WgXcQ', 'completed', '2024-01-22', '22:15', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Crop Protection Strategies - English', 'Advanced strategies for protecting crops from pests and diseases. This episode covers integrated pest management and sustainable protection methods.', 1, 3, 'English', ARRAY['crop protection', 'pests', 'diseases', 'IPM', 'sustainable'], 'drive-file-5', 'dQw4w9WgXcQ', 'completed', '2024-01-29', '18:45', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Crop Protection Strategies - Spanish', 'Estrategias avanzadas para proteger los cultivos de plagas y enfermedades. Este episodio cubre el manejo integrado de plagas y métodos de protección sostenibles.', 1, 3, 'Spanish', ARRAY['crop protection', 'pests', 'diseases', 'IPM', 'sustainable', 'spanish'], 'drive-file-6', 'dQw4w9WgXcQ', 'completed', '2024-01-29', '18:45', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

-- Season 2 Videos
('Advanced Soil Testing Methods - English', 'Learn advanced techniques for soil testing and analysis. This episode covers laboratory methods, field testing, and interpreting results.', 2, 1, 'English', ARRAY['soil testing', 'laboratory', 'field testing', 'analysis', 'advanced'], 'drive-file-7', 'dQw4w9WgXcQ', 'completed', '2024-02-05', '25:10', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Advanced Soil Testing Methods - Spanish', 'Aprende técnicas avanzadas para el análisis y prueba de suelos. Este episodio cubre métodos de laboratorio, pruebas de campo e interpretación de resultados.', 2, 1, 'Spanish', ARRAY['soil testing', 'laboratory', 'field testing', 'analysis', 'advanced', 'spanish'], 'drive-file-8', 'dQw4w9WgXcQ', 'completed', '2024-02-05', '25:10', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Nutrient Management Planning - English', 'Comprehensive guide to nutrient management planning for different crops and soil types. Learn about fertilization strategies and timing.', 2, 2, 'English', ARRAY['nutrient management', 'fertilization', 'planning', 'crops', 'timing'], 'drive-file-9', 'dQw4w9WgXcQ', 'completed', '2024-02-12', '20:30', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Nutrient Management Planning - Spanish', 'Guía integral para la planificación del manejo de nutrientes para diferentes cultivos y tipos de suelo. Aprende sobre estrategias de fertilización y temporización.', 2, 2, 'Spanish', ARRAY['nutrient management', 'fertilization', 'planning', 'crops', 'timing', 'spanish'], 'drive-file-10', 'dQw4w9WgXcQ', 'completed', '2024-02-12', '20:30', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

-- Season 3 Videos
('Sustainable Irrigation Systems - English', 'Explore sustainable irrigation systems and water management practices. Learn about drip irrigation, smart controllers, and water conservation.', 3, 1, 'English', ARRAY['irrigation', 'water management', 'drip irrigation', 'sustainable', 'conservation'], 'drive-file-11', 'dQw4w9WgXcQ', 'completed', '2024-03-01', '28:45', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Sustainable Irrigation Systems - Spanish', 'Explora sistemas de riego sostenibles y prácticas de gestión del agua. Aprende sobre riego por goteo, controladores inteligentes y conservación del agua.', 3, 1, 'Spanish', ARRAY['irrigation', 'water management', 'drip irrigation', 'sustainable', 'conservation', 'spanish'], 'drive-file-12', 'dQw4w9WgXcQ', 'completed', '2024-03-01', '28:45', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Organic Farming Certification - English', 'Complete guide to organic farming certification process and requirements. Learn about standards, documentation, and compliance.', 3, 2, 'English', ARRAY['organic farming', 'certification', 'standards', 'compliance', 'documentation'], 'drive-file-13', 'dQw4w9WgXcQ', 'completed', '2024-03-08', '32:20', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),

('Organic Farming Certification - Spanish', 'Guía completa del proceso de certificación de agricultura orgánica y requisitos. Aprende sobre estándares, documentación y cumplimiento.', 3, 2, 'Spanish', ARRAY['organic farming', 'certification', 'standards', 'compliance', 'documentation', 'spanish'], 'drive-file-14', 'dQw4w9WgXcQ', 'completed', '2024-03-08', '32:20', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')

ON CONFLICT (title, season, episode, language) DO NOTHING;

-- Create sample playlists
INSERT INTO video_playlists (name, description, season, language) VALUES
('Season 1 - English', 'Complete Season 1 in English - Fundamentals of Sustainable Agriculture', 1, 'English'),
('Season 1 - Spanish', 'Complete Season 1 in Spanish - Fundamentos de la Agricultura Sostenible', 1, 'Spanish'),
('Season 2 - English', 'Complete Season 2 in English - Advanced Agricultural Techniques', 2, 'English'),
('Season 2 - Spanish', 'Complete Season 2 in Spanish - Técnicas Agrícolas Avanzadas', 2, 'Spanish'),
('Season 3 - English', 'Complete Season 3 in English - Sustainable Systems and Certification', 3, 'English'),
('Season 3 - Spanish', 'Complete Season 3 in Spanish - Sistemas Sostenibles y Certificación', 3, 'Spanish'),
('Soil Health Series', 'Comprehensive soil health education series across all seasons', NULL, NULL),
('Crop Protection Series', 'Complete guide to crop protection and pest management', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Add videos to playlists (you can customize this based on your needs)
-- This will automatically link videos to their respective season playlists
INSERT INTO playlist_videos (playlist_id, video_id, position)
SELECT 
    p.id as playlist_id,
    v.id as video_id,
    v.episode as position
FROM video_playlists p
JOIN videos v ON p.season = v.season AND p.language = v.language
WHERE p.season IS NOT NULL AND p.language IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update video analytics with sample data
INSERT INTO video_analytics (video_id, views, likes, dislikes, comments, watch_time_minutes)
SELECT 
    v.id,
    FLOOR(RANDOM() * 1000) + 100 as views,
    FLOOR(RANDOM() * 100) + 10 as likes,
    FLOOR(RANDOM() * 10) as dislikes,
    FLOOR(RANDOM() * 50) as comments,
    FLOOR(RANDOM() * 500) + 100 as watch_time_minutes
FROM videos v
ON CONFLICT (video_id) DO NOTHING; 