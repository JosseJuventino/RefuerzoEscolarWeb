import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateAlumnoDto {
  @ApiProperty({
    description: 'Grado del alumno',
    example: '60d5f484f1d2b45c6c8f1d4a',
  })
  @IsString()
  @IsNotEmpty()
  gradoId: string;
}
