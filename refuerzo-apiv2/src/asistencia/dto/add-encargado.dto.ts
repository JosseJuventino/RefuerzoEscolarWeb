import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AsistenciaAddEncargadoDto {
  @ApiProperty({
    example: '60d5f484f1d2b45c6c8f1d4a',
    description: 'ID del usuario encargado',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: '2025-03-05T21:35:57.038+00:00',
    description: 'Fecha en formato ISO 8601',
  })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({
    example: 'asistio',
    description: 'Estado de asistencia',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    example: '2025-03-05T08:00:00.000+00:00',
    description: 'Hora de inicio como string ISO 8601',
  })
  @IsString()
  @IsNotEmpty()
  hora_inicio: string; // string en lugar de Date

  @ApiProperty({
    example: '2025-03-05T16:30:00.000+00:00',
    description: 'Hora de fin como string ISO 8601',
  })
  @IsString()
  @IsNotEmpty()
  hora_fin: string;
}
