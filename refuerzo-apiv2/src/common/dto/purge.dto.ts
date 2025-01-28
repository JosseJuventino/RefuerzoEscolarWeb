import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class PurgeDto {
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  purge?: boolean;

  constructor() {
    this.purge = false;
  }
}
