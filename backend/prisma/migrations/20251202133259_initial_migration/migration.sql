-- CreateTable
CREATE TABLE "institutions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "acronym" VARCHAR(50),
    "type" VARCHAR(100) NOT NULL,
    "cnpj" VARCHAR(20) NOT NULL,
    "address" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "zipCode" VARCHAR(10),
    "phone" VARCHAR(20),
    "email" VARCHAR(150),
    "website" VARCHAR(200),
    "rector" VARCHAR(100),
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_projects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "codeUUID" UUID NOT NULL,
    "description" TEXT,
    "area" VARCHAR(100),
    "startDate" DATE,
    "endDate" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "budget" DECIMAL(15,2),
    "fundingAgency" VARCHAR(100),
    "objectives" TEXT,
    "expectedResults" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "institutionId" UUID,
    "responsibleResearcherId" UUID,

    CONSTRAINT "research_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subgroups" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchProjectId" UUID,

    CONSTRAINT "subgroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researchers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'researcher',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" VARCHAR(20),
    "institution" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "researchProjectId" UUID,
    "subgroupId" UUID,
    "roleId" UUID,

    CONSTRAINT "researchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "visibility" VARCHAR(50) NOT NULL DEFAULT 'subgroup',
    "objective" VARCHAR(500),
    "targetAudience" VARCHAR(500),
    "targetGender" VARCHAR(50) NOT NULL DEFAULT 'all',
    "targetEducationLevel" VARCHAR(50) NOT NULL DEFAULT 'all',
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "targetLocation" VARCHAR(200),
    "options" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" UUID NOT NULL,
    "subgroupId" UUID,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaires" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" UUID NOT NULL,
    "subgroupId" UUID NOT NULL,
    "fieldResearchId" UUID,

    CONSTRAINT "questionnaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_sequences" (
    "id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionnaireId" UUID NOT NULL,
    "questionId" UUID NOT NULL,

    CONSTRAINT "question_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_researches" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50),
    "description" TEXT,
    "location" VARCHAR(100),
    "startDate" DATE,
    "endDate" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'planning',
    "targetSampleSize" INTEGER,
    "currentSampleSize" INTEGER NOT NULL DEFAULT 0,
    "methodology" VARCHAR(100),
    "ethicsApproval" VARCHAR(100),
    "observations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subgroupId" UUID,
    "responsibleId" UUID,

    CONSTRAINT "field_researches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000),
    "objectives" VARCHAR(1000),
    "targetAudience" VARCHAR(500),
    "locations" VARCHAR(500),
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "applicationMethod" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'planning',
    "estimatedResponses" INTEGER,
    "actualResponses" INTEGER NOT NULL DEFAULT 0,
    "budget" DECIMAL(15,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionnaireId" UUID NOT NULL,
    "coordinatorId" UUID NOT NULL,

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuestionnaireQuestions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_QuestionnaireQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_cnpj_key" ON "institutions"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "research_projects_codeUUID_key" ON "research_projects"("codeUUID");

-- CreateIndex
CREATE UNIQUE INDEX "subgroups_name_key" ON "subgroups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "researchers_email_key" ON "researchers"("email");

-- CreateIndex
CREATE INDEX "_QuestionnaireQuestions_B_index" ON "_QuestionnaireQuestions"("B");

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_projects" ADD CONSTRAINT "research_projects_responsibleResearcherId_fkey" FOREIGN KEY ("responsibleResearcherId") REFERENCES "researchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "subgroups" ADD CONSTRAINT "subgroups_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "research_projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "researchers" ADD CONSTRAINT "researchers_researchProjectId_fkey" FOREIGN KEY ("researchProjectId") REFERENCES "research_projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "researchers" ADD CONSTRAINT "researchers_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "researchers" ADD CONSTRAINT "researchers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "researchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "researchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_fieldResearchId_fkey" FOREIGN KEY ("fieldResearchId") REFERENCES "field_researches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question_sequences" ADD CONSTRAINT "question_sequences_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question_sequences" ADD CONSTRAINT "question_sequences_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_researches" ADD CONSTRAINT "field_researches_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "subgroups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_researches" ADD CONSTRAINT "field_researches_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "researchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "questionnaires"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "researchers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_QuestionnaireQuestions" ADD CONSTRAINT "_QuestionnaireQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionnaireQuestions" ADD CONSTRAINT "_QuestionnaireQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "questionnaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;
