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
  Res,
  NotFoundException,
  Logger,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import * as fs from 'fs';

@Controller('images')
@ApiTags('Images')
@Permission('document')
@Resources('document')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(private readonly imageService: ImageService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos para subir una imagen',
    type: CreateImageDto,
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
          description: 'Nombre original de la imagen',
        },
        category: {
          type: 'string',
          description: 'Categoría de la imagen',
        },
      },
    },
  })
  @Scopes('edit')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createImageDto: CreateImageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(
      `POST /images - Subiendo imagen: ${createImageDto.originalFilename}`,
    );
    return this.imageService.create(createImageDto, file);
  }

  @Get()
  @ApiBearerAuth()
  @Scopes('view')
  @ApiOperation({ summary: 'Obtener todas las imágenes' })
  async findAll() {
    this.logger.log(`GET /images - Obteniendo todas las imágenes`);
    return this.imageService.findAll();
  }

  @Get('download/:id')
  @ApiBearerAuth()
  @Scopes('view')
  @ApiOperation({ summary: 'Descargar imagen por ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  async downloadImage(@Param('id') id: string, @Res() res: Response) {
    this.logger.log(`GET /images/download/${id} - Descargando imagen`);
    const { image, filePath } = await this.imageService.getImageFile(id);

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${image.originalFilename}"`,
    );

    return res.sendFile(filePath);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener una imagen por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /images/${id} - Obteniendo imagen`);
    return this.imageService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Scopes('view', 'edit')
  @ApiOperation({ summary: 'Actualizar una imagen por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  async update(
    @Param('id') id: string,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    this.logger.log(`PUT /images/${id} - Actualizando imagen`);
    return this.imageService.update(id, updateImageDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Scopes('view', 'edit')
  @ApiOperation({ summary: 'Eliminar una imagen por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la imagen' })
  async delete(@Param('id') id: string) {
    this.logger.log(`DELETE /images/${id} - Eliminando imagen`);
    return this.imageService.delete(id);
  }
}
