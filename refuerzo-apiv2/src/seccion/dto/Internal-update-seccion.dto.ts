import { PartialType } from '@nestjs/mapped-types';
import { UpdateSeccionDto } from './update-seccion.dto';

export class InternalUpdateSeccionDto extends PartialType(UpdateSeccionDto) {
  slug?: string;
}