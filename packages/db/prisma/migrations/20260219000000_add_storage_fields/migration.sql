-- AlterTable: Add storagePath to Skill
ALTER TABLE "Skill" ADD COLUMN "storagePath" TEXT;

-- AlterTable: Add storagePath to SkillVersion
ALTER TABLE "SkillVersion" ADD COLUMN "storagePath" TEXT;

-- CreateTable: SkillFile
CREATE TABLE "SkillFile" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "skillVersionId" TEXT,
    "path" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text/plain',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on SkillFile (skillId, skillVersionId, path)
CREATE UNIQUE INDEX "SkillFile_skillId_skillVersionId_path_key" ON "SkillFile"("skillId", "skillVersionId", "path");

-- AddForeignKey: SkillFile -> Skill
ALTER TABLE "SkillFile" ADD CONSTRAINT "SkillFile_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: SkillFile -> SkillVersion
ALTER TABLE "SkillFile" ADD CONSTRAINT "SkillFile_skillVersionId_fkey" FOREIGN KEY ("skillVersionId") REFERENCES "SkillVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
