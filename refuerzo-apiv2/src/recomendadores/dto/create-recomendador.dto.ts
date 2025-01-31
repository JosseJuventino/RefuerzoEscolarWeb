import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsBoolean, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId } from 'typeorm';

class ContactoDto {
  @ApiProperty({
    description: 'email del recomendador',
    example: 'example@example.com',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'telefono del recomendador',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  readonly telefono: string;
}

export class CreateRecomendadorDto {
  @ApiProperty({
    description: 'Nombre del recomendador',
    example: 'Juan Carlos Bodoque',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @ApiProperty({
    description: 'Contacto del recomendador',
    example: {
      email: 'example@example.com',
      telefono: '123456789',
    },
  })
  @IsObject() // Asegúrate de que el contacto sea un objeto
  readonly contacto: ContactoDto;

  @ApiProperty({
    description: 'Imagen del postulante',
    example: 'https://example/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  readonly imagen: string;

  @ApiProperty({
    description: 'Activo',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  readonly isActive: boolean;
}
