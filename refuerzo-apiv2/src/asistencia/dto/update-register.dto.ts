import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAlumnoRegistroDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}

// update-encargado.dto.ts
export class UpdateEncargadoRegistroDto {
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsDateString()
  hora_inicio?: string;

  @IsOptional()
  @IsDateString()
  hora_fin?: string;
}
