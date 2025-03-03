import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsBoolean,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateAlumnoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradoId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  nombre: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image: string;
}
