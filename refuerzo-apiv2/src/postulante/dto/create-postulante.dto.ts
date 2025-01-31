import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  isNotEmpty,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'src/common/helper/mongodb.helper';

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
    description: 'Grado del postulante',
    example: '8 grado',
  })
  @IsString()
  @IsNotEmpty()
  readonly grado: string;

  @ApiProperty({
    description: 'Es usuario',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  readonly isUser: boolean;

  readonly recomendador: ObjectId;
}
