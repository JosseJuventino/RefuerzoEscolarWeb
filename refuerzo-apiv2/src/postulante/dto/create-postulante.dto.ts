import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostulanteDto {
  @ApiProperty({
    description: 'Nombre del postulante',
    example: 'Juanin',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @ApiProperty({
    description: 'Imagen del postulante',
    example: 'https://example/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  readonly imagen: string;

  @ApiProperty({
    description: 'Dirección del postulante',
    example: 'Calle 123',
  })
  @IsString()
  @IsNotEmpty()
  readonly direccion: string;

  @ApiProperty({
    description: 'Teléfono del postulante',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  readonly telefono: string;

  @ApiProperty({
    description: 'Correo electrónico del postulante',
    example: 'example@example.com',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Año del postulante',
    example: '2021',
  })
  @IsString()
  @IsNotEmpty()
  readonly year: string;
}
