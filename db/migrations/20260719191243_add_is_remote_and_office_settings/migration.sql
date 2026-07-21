-- AlterTable
ALTER TABLE "EmployeeProfile" ADD COLUMN     "isRemote" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OfficeSetting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'HQ Office',
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 37.7749,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT -122.4194,
    "radiusMeters" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeSetting_pkey" PRIMARY KEY ("id")
);
