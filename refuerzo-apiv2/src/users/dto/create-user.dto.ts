import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombres: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  readonly apellidos: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'ejemplo@ejemplo.com',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;

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
  @IsMongoId()
  readonly role: string;
}
