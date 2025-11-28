-- Migration 003: Add researchProjectId to researchers table
-- This migration adds the researchProjectId field to support hierarchical affiliation
-- and makes subgroupId optional

USE campo_research_db;
GO

-- Add researchProjectId column
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'researchers' 
    AND COLUMN_NAME = 'researchProjectId'
)
BEGIN
    ALTER TABLE researchers 
    ADD researchProjectId UNIQUEIDENTIFIER NULL;
    PRINT 'Column researchProjectId added to researchers table';
END
ELSE
BEGIN
    PRINT 'Column researchProjectId already exists in researchers table';
END
GO

-- Make subgroupId nullable if not already
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'researchers' 
    AND COLUMN_NAME = 'subgroupId'
    AND IS_NULLABLE = 'NO'
)
BEGIN
    ALTER TABLE researchers 
    ALTER COLUMN subgroupId UNIQUEIDENTIFIER NULL;
    PRINT 'Column subgroupId made nullable in researchers table';
END
ELSE
BEGIN
    PRINT 'Column subgroupId is already nullable in researchers table';
END
GO

-- Add foreign key constraint for researchProjectId (optional - comment if not needed)
-- IF NOT EXISTS (
--     SELECT 1 
--     FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
--     WHERE CONSTRAINT_NAME = 'FK_researchers_research_projects'
-- )
-- BEGIN
--     ALTER TABLE researchers
--     ADD CONSTRAINT FK_researchers_research_projects
--     FOREIGN KEY (researchProjectId) REFERENCES research_projects(id);
--     PRINT 'Foreign key constraint added for researchProjectId';
-- END
-- GO

PRINT 'Migration 003 completed successfully!';
GO
