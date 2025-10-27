-- CreateTable
CREATE TABLE "FitmentVehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FitmentTire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    CONSTRAINT "FitmentTire_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "FitmentVehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FitmentVehicle_year_make_model_key" ON "FitmentVehicle"("year", "make", "model");

-- CreateIndex
CREATE INDEX "FitmentTire_vehicleId_idx" ON "FitmentTire"("vehicleId");

-- CreateIndex
CREATE INDEX "FitmentTire_size_idx" ON "FitmentTire"("size");
