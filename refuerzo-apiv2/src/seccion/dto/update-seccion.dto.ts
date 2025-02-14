import { PartialType } from '@nestjs/mapped-types';
import { CreateSeccionDto } from './create-seccion.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateSeccionDto extends PartialType(CreateSeccionDto) {}
