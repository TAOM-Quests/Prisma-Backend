-- UPDATE feedback_forms
-- SET questions = ARRAY[
--   '{"type":"rating","answers":["10"],"question":"Вам понравилось проект?"}'::jsonb,
--   '{"type":"radio","answers":["Да", "Нет", "Не знаю"],"question":"Вы удовлетворены проектом?"}'::jsonb,
--   '{"type":"scale","answers":["1","Не вопрос", "10", "Вопрос"],"question":"What is your age?"}'::jsonb,
--   '{"type":"text","answers":[],"question":"What is your age?"}'::jsonb,
--   '{"type":"free","answers":[],"question":"What is your age?"}'::jsonb
-- ]
-- WHERE id = 2;

-- UPDATE feedback_answers
-- SET answers = ARRAY[
--   'Хорошо', 'Отлично', 'Отлично', 'Отлично', 'Отлично'
-- ]
-- WHERE id = 2;


-- UPDATE events
-- SET date = '2025-06-15 07:11:38.884'
-- WHERE id = 12;




-- TRUNCATE shared_files CASCADE;

-- INSERT INTO users (id, email, password) VALUES (1, "marika123@mail.com", "Marika123@mail.com");

-- UPDATE users
-- SET id_role = 1
-- WHERE id = 31;

-- UPDATE users
-- SET id_position = 1
-- WHERE id = 31;

-- UPDATE users
-- SET id_department = 1
-- WHERE id = 31;

-- UPDATE events
-- SET id_status = 5
-- WHERE id = 12;