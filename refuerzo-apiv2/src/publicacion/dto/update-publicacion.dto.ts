import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicacionDto } from './create-publicacion.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePublicacionDto extends PartialType(CreatePublicacionDto) {}
