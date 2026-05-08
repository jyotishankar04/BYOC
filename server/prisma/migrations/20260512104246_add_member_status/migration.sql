-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('Pending', 'Active');

-- AlterTable
ALTER TABLE "WorkspaceMember" ADD COLUMN     "status" "MemberStatus" NOT NULL DEFAULT 'Active';
