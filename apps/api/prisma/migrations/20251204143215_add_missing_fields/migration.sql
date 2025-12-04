/*
  Warnings:

  - You are about to drop the column `latesId` on the `researchers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "institutions" ADD COLUMN     "acronym" TEXT;

-- AlterTable
ALTER TABLE "questionnaire_questions" ADD COLUMN     "required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "researchers" DROP COLUMN "latesId",
ADD COLUMN     "lattesNumber" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PESQUISADOR';
