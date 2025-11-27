-- Habilitar autenticação mista SQL Server
USE master;
GO

-- Criar login SQL
CREATE LOGIN campo_user WITH PASSWORD = 'Campo@2024Strong';
GO

-- Usar o banco de dados
USE campo_research_db;
GO

-- Criar usuário no banco
CREATE USER campo_user FOR LOGIN campo_user;
GO

-- Conceder permissões
ALTER ROLE db_owner ADD MEMBER campo_user;
GO

PRINT 'Usuário campo_user criado com sucesso!';
GO
