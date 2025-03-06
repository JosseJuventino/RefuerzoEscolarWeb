import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AsistenciaAddAlumnoDto {
  @ApiProperty({
    example: '60d5f484f1d2b45c6c8f1d4a',
    description: 'ID del alumno',
  })
  @IsString()
  @IsNotEmpty()
  alumnoId: string;

  @ApiProperty({
    example: '2025-02-14T16:55:39.521+00:00',
    description: 'Fecha como string ISO 8601',
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
}
