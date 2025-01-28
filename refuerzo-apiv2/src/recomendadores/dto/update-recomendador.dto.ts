import { PartialType } from '@nestjs/mapped-types';
import { CreateRecomendadorDto } from './create-recomendador.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateRecomendadorDto extends PartialType(CreateRecomendadorDto) {}
