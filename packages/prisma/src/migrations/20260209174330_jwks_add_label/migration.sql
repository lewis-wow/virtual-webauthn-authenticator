-- AlterTable
ALTER TABLE "jwks" ADD COLUMN     "label" TEXT;

-- CreateIndex
CREATE INDEX "jwks_label_idx" ON "jwks"("label");
