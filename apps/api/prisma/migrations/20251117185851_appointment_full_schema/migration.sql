/*
  Warnings:

  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Technician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AppointmentService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER,
    "notes" TEXT,
    CONSTRAINT "AppointmentService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "slotStart" DATETIME NOT NULL,
    "slotEnd" DATETIME NOT NULL,
    "schedulingMode" TEXT NOT NULL DEFAULT 'WINDOW',
    "arrivalWindowStart" DATETIME,
    "arrivalWindowEnd" DATETIME,
    "scheduleState" TEXT NOT NULL DEFAULT 'DRAFT',
    "dispatchStatus" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "customerConfirmToken" TEXT,
    "customerConfirmExpires" DATETIME,
    "customerConfirmedAt" DATETIME,
    "windowLockedAt" DATETIME,
    "techId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_techId_fkey" FOREIGN KEY ("techId") REFERENCES "Technician" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" (
    "id",
    "userId",
    "vehicleId",
    "address",
    "notes",
    "slotStart",
    "slotEnd",
    "createdAt",
    "updatedAt"
) SELECT
    "id",
    "userId",
    "vehicleId",
    "address",
    "notes",
    "slotStart",
    "slotEnd",
    "createdAt",
    CURRENT_TIMESTAMP
FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");
CREATE INDEX "Appointment_vehicleId_idx" ON "Appointment"("vehicleId");
CREATE INDEX "Appointment_slotStart_slotEnd_idx" ON "Appointment"("slotStart", "slotEnd");
CREATE INDEX "Appointment_scheduleState_idx" ON "Appointment"("scheduleState");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" (
    "id",
    "name",
    "email",
    "role",
    "passwordHash",
    "phone",
    "createdAt",
    "updatedAt"
) SELECT
    "id",
    "name",
    "email",
    "role",
    "passwordHash",
    "phone",
    "createdAt",
    CURRENT_TIMESTAMP
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AppointmentService_appointmentId_idx" ON "AppointmentService"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentService_kind_idx" ON "AppointmentService"("kind");

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");
