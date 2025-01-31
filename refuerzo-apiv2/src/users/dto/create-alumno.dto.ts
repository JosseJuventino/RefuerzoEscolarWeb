import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNewAlumnoDto {

  readonly nombre: string;

  readonly email: string;

  readonly telefono: string;

  readonly image: string;

  readonly idDependingRole: string;
}
