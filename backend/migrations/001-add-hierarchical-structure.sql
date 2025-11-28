-- Migration: Add new hierarchical structure tables
-- Date: 2025-11-28

-- 1. Create institutions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'institutions')
BEGIN
    CREATE TABLE institutions (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(200) NOT NULL,
        acronym NVARCHAR(50),
        type NVARCHAR(100) NOT NULL,
        cnpj NVARCHAR(20) UNIQUE NOT NULL,
        address NVARCHAR(200),
        city NVARCHAR(100),
        state NVARCHAR(2),
        zipCode NVARCHAR(10),
        phone NVARCHAR(20),
        email NVARCHAR(150),
        website NVARCHAR(200),
        rector NVARCHAR(100),
        description NVARCHAR(MAX),
        isActive BIT DEFAULT 1,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Table institutions created successfully';
END

-- 2. Create research_projects table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'research_projects')
BEGIN
    CREATE TABLE research_projects (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(200) NOT NULL,
        code NVARCHAR(50),
        description NVARCHAR(MAX),
        area NVARCHAR(100),
        startDate DATE,
        endDate DATE,
        status NVARCHAR(50) DEFAULT 'active',
        budget DECIMAL(15,2),
        fundingAgency NVARCHAR(100),
        objectives NVARCHAR(MAX),
        expectedResults NVARCHAR(MAX),
        isActive BIT DEFAULT 1,
        institutionId UNIQUEIDENTIFIER NOT NULL,
        responsibleResearcherId UNIQUEIDENTIFIER NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (institutionId) REFERENCES institutions(id),
        FOREIGN KEY (responsibleResearcherId) REFERENCES researchers(id)
    );
    PRINT 'Table research_projects created successfully';
END

-- 3. Add researchProjectId to subgroups table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('subgroups') AND name = 'researchProjectId')
BEGIN
    ALTER TABLE subgroups ADD researchProjectId UNIQUEIDENTIFIER;
    ALTER TABLE subgroups ADD CONSTRAINT FK_subgroups_researchProject 
        FOREIGN KEY (researchProjectId) REFERENCES research_projects(id);
    PRINT 'Column researchProjectId added to subgroups';
END

-- 4. Create field_researches table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'field_researches')
BEGIN
    CREATE TABLE field_researches (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        name NVARCHAR(200) NOT NULL,
        code NVARCHAR(50),
        description NVARCHAR(MAX),
        location NVARCHAR(100),
        startDate DATE,
        endDate DATE,
        status NVARCHAR(50) DEFAULT 'planning',
        targetSampleSize INT,
        currentSampleSize INT DEFAULT 0,
        methodology NVARCHAR(100),
        objectives NVARCHAR(MAX),
        expectedResults NVARCHAR(MAX),
        ethicsCommitteeApproval NVARCHAR(MAX),
        isActive BIT DEFAULT 1,
        subgroupId UNIQUEIDENTIFIER NOT NULL,
        responsibleResearcherId UNIQUEIDENTIFIER NOT NULL,
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (subgroupId) REFERENCES subgroups(id),
        FOREIGN KEY (responsibleResearcherId) REFERENCES researchers(id)
    );
    PRINT 'Table field_researches created successfully';
END

-- 5. Add fieldResearchId to questionnaires table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('questionnaires') AND name = 'fieldResearchId')
BEGIN
    ALTER TABLE questionnaires ADD fieldResearchId UNIQUEIDENTIFIER;
    ALTER TABLE questionnaires ADD CONSTRAINT FK_questionnaires_fieldResearch 
        FOREIGN KEY (fieldResearchId) REFERENCES field_researches(id);
    PRINT 'Column fieldResearchId added to questionnaires';
END

-- 6. Create question_sequences table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'question_sequences')
BEGIN
    CREATE TABLE question_sequences (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        questionnaireId UNIQUEIDENTIFIER NOT NULL,
        questionId UNIQUEIDENTIFIER NOT NULL,
        [order] INT NOT NULL,
        isRequired BIT DEFAULT 1,
        isActive BIT DEFAULT 1,
        conditionalLogic NVARCHAR(MAX),
        helpText NVARCHAR(500),
        createdAt DATETIME2 DEFAULT GETDATE(),
        updatedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (questionnaireId) REFERENCES questionnaires(id),
        FOREIGN KEY (questionId) REFERENCES questions(id)
    );
    CREATE INDEX IX_question_sequences_questionnaire ON question_sequences(questionnaireId);
    CREATE INDEX IX_question_sequences_order ON question_sequences([order]);
    PRINT 'Table question_sequences created successfully';
END

PRINT 'Migration completed successfully!';
