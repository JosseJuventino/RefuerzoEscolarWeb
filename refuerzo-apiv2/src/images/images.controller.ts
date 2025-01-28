import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';

@Controller('images')
@Permission('blog')
@Resources('blog')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos para subir una imagen',
    type: CreateImageDto, // Usar el DTO directamente para Swagger
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'El archivo de imagen a subir',
        },
        originalFilename: {
          type: 'string',
          description: 'El nombre original del archivo',
        },
        category: {
          type: 'string',
          description: 'La categoría de la imagen',
        },
      },
    },
  })
  @Scopes('edit')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file,
    @Req() req: Request,
  ) {
    return this.imageService.create(
      createImageDto,
      file,
      req.headers['origin'],
    );
  }

  @Public()
  @Get()
  async findAll() {
    return this.imageService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imageService.findOne(id);
  }

  @Scopes('view', 'edit')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imageService.update(id, updateImageDto);
  }

  @Scopes('view', 'edit')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.imageService.delete(id);
  }
}
