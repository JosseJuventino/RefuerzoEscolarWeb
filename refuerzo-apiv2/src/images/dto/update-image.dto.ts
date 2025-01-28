import { IsString, IsOptional } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  category?: string;
}
