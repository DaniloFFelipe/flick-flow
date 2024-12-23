/*
  Warnings:

  - Changed the type of `duration_in_sec` on the `contents` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "contents" DROP COLUMN "duration_in_sec",
ADD COLUMN     "duration_in_sec" INTEGER NOT NULL;
