// vehicles/vehicles.module.ts
import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VehicleCatalogService } from './vehicle-catalog.service';
import { VehicleCatalogController } from './vehicle-catalog.controller';

@Module({
  providers: [VehiclesService, VehicleCatalogService],
  controllers: [VehiclesController, VehicleCatalogController],
})
export class VehiclesModule {}
