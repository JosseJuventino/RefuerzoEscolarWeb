import { IsEmail, IsString } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;

  @IsString()
  token: string;
}