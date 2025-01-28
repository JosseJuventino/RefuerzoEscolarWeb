import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class PagePermissionsDto {
  @ApiProperty({ description: 'Permission to view', example: true })
  @IsBoolean()
  view: boolean;

  @ApiProperty({ description: 'Permission to edit', example: true })
  @IsBoolean()
  edit: boolean;
}

class PagesDto {
  @ApiProperty({ type: PagePermissionsDto })
  @ValidateNested()
  @Type(() => PagePermissionsDto)
  blog: PagePermissionsDto;

  @ApiProperty({ type: PagePermissionsDto })
  @ValidateNested()
  @Type(() => PagePermissionsDto)
  usuarios: PagePermissionsDto;

  @ApiProperty({ type: PagePermissionsDto })
  @ValidateNested()
  @Type(() => PagePermissionsDto)
  programacion: PagePermissionsDto;

  @ApiProperty({ type: PagePermissionsDto })
  @ValidateNested()
  @Type(() => PagePermissionsDto)
  role: PagePermissionsDto;
}

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Pages of the role',
    example: {
      usuarios: { view: true, edit: true },
      roles: { view: true, edit: true },
      postulantes: { view: true, edit: true },
      secciones: { view: true, edit: true },
      alumnos: { view: true, edit: true },
      recomendadores: { view: true, edit: true },
    },
  })
  @ValidateNested()
  @IsObject()
  @Type(() => PagesDto)
  pages: PagesDto;
}
