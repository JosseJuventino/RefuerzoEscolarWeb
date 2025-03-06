// dto/create-asistencia.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsISO8601,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

class AsistenciaAlumnoDto {
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

class AsistenciaEncargadoDto {
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

export class CreateAsistenciaDto {
  @ApiProperty({
    description: 'ID de la sección',
    example: '60d5f484f1d2b45c6c8f1d4a',
  })
  @IsString()
  @IsNotEmpty()
  seccionId: string;

  @ApiProperty({
    type: [AsistenciaAlumnoDto],
    description: 'Lista de asistencias de alumnos',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaAlumnoDto)
  @ArrayMinSize(0)
  alumnos?: AsistenciaAlumnoDto[];

  @ApiProperty({
    type: [AsistenciaEncargadoDto],
    description: 'Lista de asistencias de encargados',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaEncargadoDto)
  @ArrayMinSize(0)
  encargados?: AsistenciaEncargadoDto[];
}
