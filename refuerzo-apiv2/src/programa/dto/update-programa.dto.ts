import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaDto } from './create-programa.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateProgramaDto extends PartialType(CreateProgramaDto) {}
