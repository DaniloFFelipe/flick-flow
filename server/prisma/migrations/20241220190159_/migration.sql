-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('pending', 'processing', 'ready');

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "thumbnail_path" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration_in_sec" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'pending',
    "originalLocation" TEXT NOT NULL,
    "location" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
