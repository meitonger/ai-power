// vehicles/vehicles.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly svc: VehiclesService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) { return this.svc.create(dto); }

  @Get()
  list() { return this.svc.findAll(); }
}
