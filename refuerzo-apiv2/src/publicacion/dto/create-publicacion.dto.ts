import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { url } from 'inspector';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'src/common/helper/mongodb.helper';

export class CreatePublicacionDto {
  @ApiProperty({
    description: 'Descripción de la publicación',
    example: 'Esta es una publicación de ejemplo',
  })
  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @ApiProperty({
    description: 'Categoría de la publicación',
    example: 'anuncio',
    enum: ['anuncio', 'guia'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['anuncio', 'material de apoyo'])
  readonly categoria: string;

  @ApiProperty({
    description: 'Archivos adjuntos a la publicación',
    example: [
      {
        id: '651f8b5a1c2d4a3d4f8b5a1c',
        originalFileName: 'image.jpg',
        url: 'https://example.com/image.jpg',
        tipo: 'imagen',
      },
      {
        id: '651f8b5a1c2d4a3d4f8b5a1d',
        originalFileName: 'document.pdf',
        url: 'https://example.com/document.pdf',
        tipo: 'documento',
      },
    ],
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        originalFileName: { type: 'string' },
        url: { type: 'string' },
        tipo: { type: 'string', enum: ['imagen', 'documento'] },
      },
    },
  })
  @IsArray()
  @IsNotEmpty()
  readonly files: any[];

  @ApiProperty({
    description: 'ID de la sección a la que pertenece la publicación',
    example: '651f8b5a1c2d4a3d4f8b5a1c',
  })
  @IsString()
  @IsNotEmpty()
  readonly seccionId: string; // Usar ObjectId si es necesario
}
