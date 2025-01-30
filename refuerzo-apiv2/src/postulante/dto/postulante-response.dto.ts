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
    description: 'email del postulante',
    example: 'postulante email',
  })
  email: string;

  @ApiProperty({
    description: 'grado del postulante',
    example: 'postulante grado',
  })
  grado: string;

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
    description: 'Fecha de envio del postulante',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion del postulante',
  })
  updatedAt: Date;
}
