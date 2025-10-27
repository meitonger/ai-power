// users/dto/create-user.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';
export class CreateUserDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() role?: string;
  @IsString() password!: string;
  @IsOptional() @IsString() phone?: string;
}
