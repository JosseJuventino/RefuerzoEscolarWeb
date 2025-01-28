import { ApiProperty } from '@nestjs/swagger';
import { IsHash, IsJWT, IsNotEmpty } from 'class-validator';

export class CreateTokensDto {
  @ApiProperty({
    description: 'Token JWT',
    example: 'My Token',
  })
  @IsJWT()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Hash of the token',
    example: 'My Hash',
  })
  @IsHash('bcrypt', {
    message: 'Invalid hash',
  })
  @IsNotEmpty()
  hash: string;
}
