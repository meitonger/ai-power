// vehicles/dto/create-vehicle.dto.ts
import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVehicleDto {
  @IsString() userId!: string;
  @IsString() make!: string;
  @IsString() model!: string;
  @Type(() => Number) @IsInt() year!: number;
  @IsString() trim!: string;
  @IsString() tireSize!: string;
}
