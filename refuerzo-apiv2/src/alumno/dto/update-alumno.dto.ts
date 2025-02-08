import { PartialType } from '@nestjs/mapped-types';
import { CreateAlumnoDto } from './create-alumno.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateAlumnoDto extends PartialType(CreateAlumnoDto) {}
