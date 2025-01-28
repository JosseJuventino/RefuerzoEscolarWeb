import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({
    description: 'El nombre original del archivo',
    example: 'example',
  })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({ description: 'La categoría de la imagen', example: 'nature' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'El archivo de imagen a subir',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
