import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsArray,
  IsEmpty,
} from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateSeccionDto {
  @ApiProperty({
    description: 'Nombre del curso',
    example: 'Matemáticas',
  })
  @IsString()
  @IsOptional()
  readonly nombre: string;

  @ApiProperty({
    description: 'Id del grado al que pertenece el curso',
    example: 'grado1',
  })
  @IsMongoId()
  @IsOptional()
  readonly gradoId: string;

  @ApiProperty({
    description: 'Lista de encargados',
    example: ['userId1', 'userId2'],
  })
  @IsArray()
  @IsOptional()
  readonly encargados: string[];

  @ApiProperty({
    description: 'Lista de alumnos',
    example: ['idalumno1', 'idalumno2'],
  })
  @IsArray()
  @IsOptional()
  readonly alumnos: string[];

  @ApiProperty({
    description: 'Imagen de fondo de la sección',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsString()
  @IsString()
  @IsOptional()
  readonly backgroundImage?: string; 

  

  
}
