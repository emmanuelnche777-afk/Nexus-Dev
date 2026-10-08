ALTER TABLE "TechHubConversation" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "TechHubConversation_archivedAt_idx" ON "TechHubConversation"("archivedAt");
