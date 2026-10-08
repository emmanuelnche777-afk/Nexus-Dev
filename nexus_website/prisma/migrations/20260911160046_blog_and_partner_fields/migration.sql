-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "categoryFr" TEXT,
ADD COLUMN     "date" TEXT,
ADD COLUMN     "excerptFr" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readingTime" TEXT,
ADD COLUMN     "seo" JSONB,
ADD COLUMN     "titleFr" TEXT;

-- AlterTable
ALTER TABLE "PartnerInquiry" ADD COLUMN     "interest" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");
