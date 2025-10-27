// apps/api/appointments/dto/create-appointment.dto.ts
import { IsArray, IsISO8601, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// Allowed values since we no longer use Prisma enums on SQLite
export const SERVICE_KIND_VALUES = [
  'TIRE_SWAP',
  'MOUNT_BALANCE',
  'TPMS',
  'ROTATION',
  'OIL_CHANGE',
  'OTHER',
] as const;
export type ServiceKindString = typeof SERVICE_KIND_VALUES[number];

export class CreateServiceItemDto {
  @IsString()
  @IsIn(SERVICE_KIND_VALUES as unknown as string[])
  kind!: ServiceKindString;

  @IsString()
  name!: string;

  @IsInt()
  @Type(() => Number)
  qty: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  unitPrice?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @IsISO8601()
  slotStart!: string;

  @IsISO8601()
  slotEnd!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsISO8601()
  arrivalWindowStart?: string;

  @IsOptional()
  @IsISO8601()
  arrivalWindowEnd?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceItemDto)
  services?: CreateServiceItemDto[];
}
