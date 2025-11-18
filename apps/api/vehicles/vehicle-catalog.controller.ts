import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VehicleCatalogService } from './vehicle-catalog.service';

@Controller('vehicles/catalog')
export class VehicleCatalogController {
  constructor(private readonly catalog: VehicleCatalogService) {}

  @Get('makes')
  getMakes(@Query('search') search?: string) {
    return this.catalog.getMakes(search);
  }

  @Get('models')
  async getModels(
    @Query('makeId') makeIdRaw?: string,
    @Query('makeName') makeName?: string,
    @Query('search') search?: string,
  ) {
    let makeId = makeIdRaw ? Number.parseInt(makeIdRaw, 10) : undefined;

    if ((!makeId || Number.isNaN(makeId)) && makeName?.trim()) {
      const matches = await this.catalog.getMakes(makeName);
      const exact = matches.find((m) => m.name.toLowerCase() === makeName.toLowerCase());
      makeId = exact?.id;
    }

    if (!makeId || Number.isNaN(makeId)) {
      throw new BadRequestException('Query parameter "makeId" (numeric) is required to list models.');
    }

    return this.catalog.getModels(makeId, { search });
  }
}
