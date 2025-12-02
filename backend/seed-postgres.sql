-- Seed inicial para PostgreSQL
INSERT INTO roles (id, name, description, "isActive", "createdAt", "updatedAt") 
VALUES 
  (gen_random_uuid(), 'admin', 'Administrador do sistema', true, NOW(), NOW()),
  (gen_random_uuid(), 'coordinator', 'Coordenador de projeto', true, NOW(), NOW()),
  (gen_random_uuid(), 'researcher', 'Pesquisador', true, NOW(), NOW()),
  (gen_random_uuid(), 'viewer', 'Visualizador', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Usuário admin (senha: senha123)
INSERT INTO researchers (id, name, email, password, role, "isActive", "createdAt", "updatedAt") 
SELECT 
  gen_random_uuid(), 
  'Admin User', 
  'admin@teste.com', 
  '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FGbqRKjPj8Ux9rGVvZQ5LM6XJFQ5fK6',
  'admin',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM researchers WHERE email = 'admin@teste.com');

SELECT 'Dados iniciais criados!' as status;
