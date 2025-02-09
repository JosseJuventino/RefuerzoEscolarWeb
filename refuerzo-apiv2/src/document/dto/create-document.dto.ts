// create-document.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'El nombre original del archivo',
    example: 'documento.pdf',
  })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({
    description: 'La categoría del documento',
    example: 'contratos',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'El archivo PDF a subir',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}
