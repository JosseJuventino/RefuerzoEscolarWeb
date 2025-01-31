import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNewRecomendadorDto {
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
    description: 'Image of the user',
    example: 'https://exampleimageurl.com/image.jpg',
  })
  @IsString()
  @IsNotEmpty()
  readonly image: string;
}
