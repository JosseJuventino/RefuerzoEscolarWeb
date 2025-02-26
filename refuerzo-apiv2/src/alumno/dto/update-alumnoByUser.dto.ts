import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateAlumnoByUserDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  image: string;
}
