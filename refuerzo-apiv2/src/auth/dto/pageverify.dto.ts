import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PageverifyDto {
  @ApiProperty({
    description: 'Page',
    example: 'home',
  })
  @IsString()
  @IsNotEmpty()
  page: string;
}
