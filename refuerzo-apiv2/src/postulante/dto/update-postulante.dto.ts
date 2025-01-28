import { PartialType } from '@nestjs/mapped-types';
import { CreatePostulanteDto } from './create-postulante.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePostulanteDto extends PartialType(CreatePostulanteDto) {}
