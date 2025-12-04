# Instruções para Popular o Banco de Dados

## ⚠️ Problema Identificado

O schema do banco possui dependências circulares que dificultam a criação automática de dados de teste:
- `Institution` requer um `coordinatorId` (Researcher)
- `Researcher` requer um `primaryInstitutionId` (Institution)

## 🔧 Soluções

### Opção 1: Usar Prisma Studio (RECOMENDADO)

```bash
cd apps/api
npx prisma studio
```

No Prisma Studio, você pode:
1. Criar manualmente registros nas tabelas
2. Visualizar e editar dados existentes
3. Explorar todas as relações

### Opção 2: Criar Usuário Via API (SignUp)

A API já possui endpoint de registro funcionando:

```bash
POST http://localhost:3001/auth/signup
Content-Type: application/json

{
  "email": "teste@exemplo.com",
  "password": "Senha@123",
  "cpf": "12345678900",
  "name": "Usuário Teste"
}
```

### Opção 3: SQL Direto (Para Desenvolvedores)

Se você tem acesso direto ao PostgreSQL:

```sql
-- 1. Criar usuário
INSERT INTO users (email, password, cpf, name)
VALUES ('admin@teste.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LzaOBKvZSiOK6sM3u', '12345678900', 'Admin');

-- 2. Pegar o ID do usuário
SELECT id FROM users WHERE email = 'admin@teste.com';

-- 3. Criar pesquisador (use o ID acima)
INSERT INTO researchers (user_id) VALUES ('<ID_DO_USUARIO>');

-- 4. Pegar o ID do pesquisador
SELECT id FROM researchers WHERE user_id = '<ID_DO_USUARIO>';

-- 5. Criar instituição (use o ID do pesquisador)
INSERT INTO institutions (cnpj, name, city, state, country, coordinator_id)
VALUES ('12345678000190', 'Instituição Teste', 'São Paulo', 'SP', 'Brasil', '<ID_DO_PESQUISADOR>');

-- 6. Pegar o ID da instituição
SELECT id FROM institutions WHERE cnpj = '12345678000190';

-- 7. Atualizar pesquisador com instituição
UPDATE researchers 
SET primary_institution_id = '<ID_DA_INSTITUICAO>' 
WHERE id = '<ID_DO_PESQUISADOR>';
```

**Senha para todos os usuários de teste**: `Senha@123`  
**Hash bcrypt**: `$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LzaOBKvZSiOK6sM3u`

### Opção 4: Usar API Swagger para Popular

1. Acesse: http://localhost:3001/api/docs
2. Use o endpoint `POST /auth/signup` para criar usuários
3. Após autenticado, use os outros endpoints para criar:
   - Instituições (POST /institutions)
   - Projetos (POST /projects)
   - Grupos de Pesquisa (POST /research-groups)
   - Questionários (POST /questionnaires)
   - Etc.

## 📝 Marcação com "#"

Para marcar dados para posterior deleção, ao criar via API ou SQL, adicione "#" no início dos campos de texto:

```json
{
  "name": "#Usuário Teste",
  "cpf": "#12345678900",
  "description": "#Dados de teste"
}
```

Depois, para deletar todos os dados marcados:

```sql
DELETE FROM users WHERE name LIKE '#%';
DELETE FROM institutions WHERE name LIKE '#%';
-- Etc.
```

## 🎯 Próximos Passos

1. **Recomendado**: Use `POST /auth/signup` no Swagger para criar usuários
2. Use Prisma Studio para visualizar os dados: `npx prisma studio`
3. Teste os endpoints na documentação Swagger: http://localhost:3001/api/docs

## 📚 Credenciais de Teste Sugeridas

```
Email: admin@teste.com
Senha: Senha@123
CPF: 11111111111
Nome: #Admin Teste
```

```
Email: pesquisador@teste.com
Senha: Senha@123
CPF: 22222222222
Nome: #Pesquisador Teste
```
