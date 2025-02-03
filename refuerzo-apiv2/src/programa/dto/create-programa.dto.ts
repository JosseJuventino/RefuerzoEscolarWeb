import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateProgramaDto {
  @ApiProperty({
    description: 'Nombre del programa',
    example: 'Las palmas',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

}
