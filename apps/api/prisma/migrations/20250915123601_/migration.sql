/*
  Warnings:

  - You are about to drop the `FitmentTire` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FitmentVehicle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FitmentTire";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FitmentVehicle";
PRAGMA foreign_keys=on;
