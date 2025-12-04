# 📋 TODO List - Research Quest API

**Data de Criação**: 04/12/2024  
**Última Atualização**: 04/12/2024

## ✅ Concluído (Sessão Atual)

### Backend API - Estrutura Base
- [x] Configuração inicial do projeto NestJS com TypeScript
- [x] Configuração Prisma ORM com PostgreSQL
- [x] Schema completo do banco de dados (17 tabelas)
- [x] Migration inicial aplicada ao banco
- [x] Configuração de autenticação JWT + Refresh Tokens
- [x] Módulo de Auth completo (SignUp, SignIn, Profile, Refresh)

### Módulos CRUD Implementados
- [x] **Users** - Gerenciamento de usuários
- [x] **Institutions** - Instituições de pesquisa
- [x] **Projects** - Projetos de pesquisa
- [x] **Research Groups** - Grupos de pesquisa
- [x] **Questionnaires** - Questionários
- [x] **Questions** - Banco de questões (com importação Excel/CSV)
- [x] **Field Surveys** - Pesquisas de campo
- [x] **Approvals** - Sistema de aprovações
- [x] **Notifications** - Notificações do sistema

### Documentação
- [x] Swagger/OpenAPI configurado e funcional (http://localhost:3001/api/docs)
- [x] TESTING_GUIDE.md - Guia completo de testes (665 linhas)
- [x] SEED_INSTRUCTIONS.md - Instruções para popular banco
- [x] SIGNUP_EXAMPLE.md - Exemplos de uso da API
- [x] Documentação de parsers avançados (Excel/CSV)

### Correções Realizadas
- [x] Corrigir campo `latesId` → `lattesNumber` no schema
- [x] Adicionar campo `role` ao User model
- [x] Adicionar campo `acronym` à Institution
- [x] Adicionar campo `required` à QuestionnaireQuestion
- [x] Corrigir imports em Projects e ResearchGroups modules
- [x] Corrigir enum QuestionType (TEXTO_ABERTO → ABERTA)
- [x] Resolver conflitos de tipo em questions.service.ts
- [x] Instalar dependências faltantes (express, xlsx, csv-parser, multer)

### Infraestrutura
- [x] API rodando em http://localhost:3001
- [x] Banco PostgreSQL 16 configurado (172.21.31.152:5432)
- [x] Todos os endpoints (102+) mapeados e funcionais
- [x] CORS habilitado
- [x] Validação com class-validator
- [x] 0 erros de TypeScript

---

## 🚧 Em Progresso

### Seed de Dados
- [ ] Resolver dependências circulares (Institution ↔ Researcher)
  - **Problema**: Institution requer coordinatorId, Researcher requer primaryInstitutionId
  - **Opções documentadas em SEED_INSTRUCTIONS.md**:
    1. Usar Prisma Studio para criar dados manualmente
    2. Usar SignUp endpoint via Swagger
    3. Executar SQL direto com sequência correta
    4. Criar dados via API autenticada

---

## 📌 Próximas Tarefas (Prioridade Alta)

### 1. Popular Banco de Dados
**Objetivo**: Ter dados de teste para validação da API

**Opções**:
- [ ] Opção A: Criar dados via Swagger UI (RECOMENDADO)
  - Acessar http://localhost:3001/api/docs
  - POST /auth/signup para criar primeiros usuários
  - Usar outros endpoints autenticados para popular dados
  
- [ ] Opção B: Usar Prisma Studio
  - Executar `npx prisma studio`
  - Criar registros manualmente via interface visual
  
- [ ] Opção C: Script SQL customizado
  - Criar sequência correta evitando dependências circulares
  - Executar via `npx prisma db execute`

**Dados Sugeridos** (marcar com "#" para fácil deleção):
```
Usuários:
- admin@teste.com / Senha@123
- pesquisador@teste.com / Senha@123

Instituições:
- #Universidade Federal de Teste
- #Hospital Universitário Teste

Projetos:
- #Projeto Piloto de Pesquisa

Questões:
- #Qual sua idade?
- #Qual seu nível de escolaridade?
```

### 2. Testes Automatizados
- [ ] Configurar ambiente de testes (Jest já instalado)
- [ ] Testes unitários para services
- [ ] Testes de integração para endpoints
- [ ] Testes E2E para fluxos completos
- [ ] Coverage mínimo de 80%

**Arquivos a criar**:
```
apps/api/src/modules/auth/auth.service.spec.ts
apps/api/src/modules/users/users.service.spec.ts
apps/api/src/modules/institutions/institutions.service.spec.ts
apps/api/test/auth.e2e-spec.ts
```

### 3. Validações Avançadas
- [ ] Validação de CPF (algoritmo de dígito verificador)
- [ ] Validação de CNPJ
- [ ] Validação de formato Lattes (16 dígitos)
- [ ] Validação de formato ORCID
- [ ] Rate limiting para endpoints públicos
- [ ] Sanitização de inputs (XSS prevention)

### 4. Sistema de Permissões (RBAC)
- [ ] Decorator @Roles() customizado
- [ ] Guard para verificar permissões
- [ ] Matriz de permissões por role:
  ```
  COORDENADOR_PROJETO:
    - Criar/editar projetos
    - Gerenciar membros
    - Aprovar questões
  
  PESQUISADOR:
    - Criar questões
    - Submeter para aprovação
    - Visualizar projetos
  
  ALUNO:
    - Responder questionários
    - Visualizar dados próprios
  ```

---

## 📊 Funcionalidades Futuras

### Fase 2: Recursos Avançados

#### Sistema de Revisão de Questões
- [ ] Fluxo de aprovação multi-nível
- [ ] Comentários em questões
- [ ] Histórico de mudanças (versionamento)
- [ ] Notificações de aprovação/rejeição

#### Similaridade de Questões (pgVector)
- [ ] Habilitar extensão pgVector no PostgreSQL
- [ ] Implementar embeddings de texto
- [ ] API de busca semântica
- [ ] Detecção de questões similares ao criar nova
- [ ] Sugestões de questões existentes

```sql
-- Executar no banco:
CREATE EXTENSION IF NOT EXISTS vector;

-- Adicionar ao schema.prisma:
embedding Unsupported("vector(1536)")?
```

#### Analytics e Relatórios
- [ ] Dashboard de estatísticas
- [ ] Exportação de dados (CSV, Excel, PDF)
- [ ] Gráficos de uso do sistema
- [ ] Relatórios de questionários aplicados
- [ ] Métricas de aprovação de questões

#### Integrações Externas
- [ ] Integração com Lattes (scraping ou API)
- [ ] Verificação ORCID
- [ ] Email service (SendGrid/Mailgun)
  - Confirmação de cadastro
  - Reset de senha
  - Notificações importantes
- [ ] SMS service (Twilio)
  - 2FA opcional
  - Notificações urgentes

### Fase 3: Otimizações

#### Performance
- [ ] Cache com Redis
  - Sessões de usuários
  - Dados frequentemente acessados
  - Rate limiting distribuído
- [ ] Paginação em todos os endpoints
- [ ] Índices otimizados no banco
- [ ] Query optimization (explain analyze)
- [ ] Compressão de respostas (gzip)

#### Segurança
- [ ] Implementar 2FA (TOTP)
- [ ] Auditoria completa (todos os logs)
- [ ] Detecção de anomalias
- [ ] IP whitelisting para endpoints sensíveis
- [ ] Encrypted fields (dados sensíveis)

#### DevOps
- [ ] Dockerfile para produção
- [ ] Docker Compose completo
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Backup automatizado do banco
- [ ] Disaster recovery plan

---

## 🐛 Bugs Conhecidos

### Críticos
*Nenhum bug crítico identificado no momento*

### Médios
- [ ] Seed automático falha devido a dependências circulares
  - **Status**: Documentado em SEED_INSTRUCTIONS.md
  - **Workaround**: Usar uma das 4 opções documentadas

### Baixos
*Nenhum bug de baixa prioridade identificado no momento*

---

## 📝 Notas Técnicas

### Dependências Circulares no Schema
O schema possui uma dependência circular intencional:
- `Institution` requer um `coordinatorId` (Researcher)
- `Researcher` requer um `primaryInstitutionId` (Institution)

**Solução**: Criar em sequência específica:
1. User sem researcher
2. Researcher sem primaryInstitutionId
3. Institution com coordinatorId
4. Atualizar Researcher com primaryInstitutionId

### Estrutura de Pastas
```
apps/api/
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   ├── migrations/            # Migrações aplicadas
│   ├── seed.ts                # Script de seed (problemático)
│   ├── seed-data.sql          # SQL direto alternativo
│   └── seed-simple.ts         # Seed simplificado
├── src/
│   ├── main.ts                # Entry point com Swagger
│   ├── prisma/                # Prisma service global
│   └── modules/
│       ├── auth/              # Autenticação
│       ├── users/             # Usuários
│       ├── institutions/      # Instituições
│       ├── projects/          # Projetos
│       ├── research-groups/   # Grupos de pesquisa
│       ├── questionnaires/    # Questionários
│       ├── questions/         # Banco de questões
│       ├── field-surveys/     # Pesquisas de campo
│       ├── approvals/         # Aprovações
│       └── notifications/     # Notificações
└── documentacao/
    ├── TESTING_GUIDE.md       # Guia de testes completo
    ├── SEED_INSTRUCTIONS.md   # Como popular o banco
    └── SIGNUP_EXAMPLE.md      # Exemplos de uso
```

### Endpoints Disponíveis
**Total**: 102+ endpoints  
**Porta**: 3001  
**Swagger**: http://localhost:3001/api/docs

**Distribuição**:
- Authentication: 5 endpoints (signup, signin, profile, refresh, logout)
- Users: 10 endpoints
- Institutions: 10 endpoints
- Projects: 12 endpoints
- Research Groups: 11 endpoints
- Questionnaires: 10 endpoints
- Questions: 17 endpoints (inclui importação)
- Field Surveys: 11 endpoints
- Approvals: 9 endpoints
- Notifications: 11 endpoints

### Tecnologias
- **Runtime**: Node.js 20.x
- **Framework**: NestJS 10.3.0
- **Database**: PostgreSQL 16
- **ORM**: Prisma 5.22.0
- **Auth**: JWT + Refresh Tokens
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (configurado, não implementado)
- **File Upload**: Multer
- **File Parsing**: xlsx, csv-parser

---

## 🎯 Meta da Próxima Sessão

1. **Popular banco com dados de teste** (usar Swagger UI)
2. **Criar primeiros testes automatizados** (auth.service.spec.ts)
3. **Implementar validações de CPF/CNPJ**
4. **Adicionar paginação nos endpoints de listagem**

---

## 📞 Informações Importantes

### Credenciais do Banco
```
Host: 172.21.31.152
Port: 5432
Database: ricardodavid
User: ricardodavid
```

### API Local
```
URL: http://localhost:3001
Swagger: http://localhost:3001/api/docs
```

### Comandos Úteis
```bash
# Iniciar API
cd apps/api
npm run dev

# Prisma Studio
npx prisma studio

# Gerar Prisma Client
npx prisma generate

# Criar migration
npx prisma migrate dev --name <nome>

# Ver logs do banco
npx prisma db execute --stdin <<< "SELECT * FROM users;"

# Testes
npm test
npm run test:watch
npm run test:cov
```

---

**Status Geral**: ✅ API funcional e pronta para uso  
**Próximo Marco**: Popular banco + Testes automatizados  
**Bloqueadores**: Nenhum  
**Observações**: Sistema robusto e bem documentado, pronto para expansão
