-- Seed: Popular banco com dados de teste marcados com #
-- Senha para todos os usuários: Senha@123
-- Hash bcrypt: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LzaOBKvZSiOK6sM3u

-- 1. Usuário Admin
INSERT INTO users (id, email, password, cpf, name, role)
VALUES 
  (gen_random_uuid(), 'admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LzaOBKvZSiOK6sM3u', '#12345678900', '#Admin Teste', 'COORDENADOR_PROJETO')
ON CONFLICT (email) DO NOTHING;

-- Adicionar mais dados básicos marcados com #
INSERT INTO users (id, email, password, cpf, name, role)
VALUES 
  (gen_random_uuid(), 'pesquisador@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LzaOBKvZSiOK6sM3u', '#98765432100', '#Pesquisador Teste', 'PESQUISADOR')
ON CONFLICT (email) DO NOTHING;

SELECT 'Dados de teste inseridos com sucesso!' AS status;
SELECT '✅ Login: admin@teste.com / Senha: Senha@123' AS credenciais;
SELECT '✅ Login: pesquisador@teste.com / Senha: Senha@123' AS credenciais2;
