import { IsString, IsOptional } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  category?: string;
}
