import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';

export class RecomendadorDto {
  @ApiProperty({
    description: 'Nombre del recomendador',
    example: 'recomendador nombre',
  })
  nombreCompleto: string;

  @ApiProperty({
    description: 'email del recomendador',
    example: 'recomendador@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'imagen del recomendador',
    example: 'uploads/recomendador.jpg',
  })
  image: string;
}

export class GradoDto {
  @ApiProperty({
    description: 'Nombre del grado',
    example: 'grado nombre',
  })
  nombre: string;
}

export class ProgramaDto {
  @ApiProperty({
    description: 'Nombre del programa',
    example: 'programa nombre',
  })
  nombre: string;
}

export class PostulanteResponseDto {
  @ApiProperty({
    description: 'ID del postulante',
    example: '60d5f484f1d2b45c6c8f1d4b',
  })
  _id: ObjectId;

  @ApiProperty({
    description: 'nombre del postulante',
    example: 'postulante nombre',
  })
  nombre: string;

  @ApiProperty({
    description: 'nombre del postulante',
    example: 'postulante nombre',
  })
  imagen: string;

  @ApiProperty({
    description: 'direccion del postulante',
    example: 'postulante direccion',
  })
  direccion: string;

  @ApiProperty({
    description: 'telefono del postulante',
    example: 'postulante telefono',
  })
  telefono: string;

  @ApiProperty({
    description: 'teléfono del encargado',
    example: '123456789',
  })
  telefonoEncargado: string;

  @ApiProperty({
    description: 'email del postulante',
    example: 'postulante email',
  })
  email: string;


  @ApiProperty({
    description: 'si el postulante es usuario',
    example: true,
  })
  isUser: boolean;

  @ApiProperty({
    description: 'Detalles del recomendador asociado al postulante',
    type: RecomendadorDto,
  })
  recomendador: RecomendadorDto;

  @ApiProperty({
    description: 'Detalles del grado asociado al postulante',
    type: GradoDto,
  })
  grado: GradoDto;

  @ApiProperty({
    description: 'Detalles del programa asociado al postulante',
    type: ProgramaDto,
  })
  programa: ProgramaDto;

  @ApiProperty({
    description: 'Fecha de envio del postulante',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion del postulante',
  })
  updatedAt: Date;
}
