-- Atualizar todas as senhas para senha123 com hash bcrypt correto
UPDATE researchers 
SET password = '$2b$10$uJAuNflAK4bz.4SHQ867deJG4BD8IA7DhqXsKcFLjZDgtpxr/eHru'
WHERE TRUE;

-- Verificar atualização
SELECT 
  email, 
  name, 
  role,
  LEFT(password, 30) as hash_preview
FROM researchers 
ORDER BY email;

SELECT 'Senhas atualizadas para senha123 (bcrypt)' as status;
