import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'ejemplo@ejemplo.com',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  readonly telefono: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    description: 'Image of the user',
    example: 'https://exampleimageurl.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  readonly image: string;

  @ApiProperty({
    description: 'Roles of the user',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  readonly role: string;

  @ApiProperty({
    description: 'Id depending on the role of the user',
    example: '60d5f484f1d2b45c6c8f1d4b',
  })
  @IsOptional()
  readonly idDependingRole: string;
}
