import { PartialType } from '@nestjs/mapped-types';
import { CreateGradoDto } from './create-grado.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateGradoDto extends PartialType(CreateGradoDto) {}
