import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateGradoDto {
  @ApiProperty({
    description: 'Nombre del grado',
    example: '8° grado',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

}
