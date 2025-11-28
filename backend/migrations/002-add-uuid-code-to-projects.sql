-- Migration: Make code field UUID with auto-generation
-- Date: 2025-11-28

-- 1. Add new UUID code column to research_projects
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('research_projects') AND name = 'codeUUID')
BEGIN
    ALTER TABLE research_projects ADD codeUUID UNIQUEIDENTIFIER DEFAULT NEWID();
    PRINT 'Column codeUUID added to research_projects';
END

-- 2. Make code column nullable temporarily
ALTER TABLE research_projects ALTER COLUMN code NVARCHAR(50) NULL;
PRINT 'Column code made nullable';

-- 3. Create index on codeUUID for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_research_projects_codeUUID' AND object_id = OBJECT_ID('research_projects'))
BEGIN
    CREATE UNIQUE INDEX IX_research_projects_codeUUID ON research_projects(codeUUID);
    PRINT 'Index created on codeUUID';
END

PRINT 'Migration completed successfully!';
