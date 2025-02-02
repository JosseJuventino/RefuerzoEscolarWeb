// update-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Nueva imagen de perfil (URL)',
    required: false
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Nuevo número de teléfono',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(8, 15)
  telefono?: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(8, 30)
  password?: string;
}