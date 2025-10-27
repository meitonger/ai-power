import { IsISO8601, IsOptional, IsString } from 'class-validator';
export class UpdateAppointmentDto {
  @IsOptional() @IsISO8601() slotStart?: string;
  @IsOptional() @IsISO8601() slotEnd?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsISO8601() arrivalWindowStart?: string;
  @IsOptional() @IsISO8601() arrivalWindowEnd?: string;
  @IsOptional() @IsString() techId?: string;
}
