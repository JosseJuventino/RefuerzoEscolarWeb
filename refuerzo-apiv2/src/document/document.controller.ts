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
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import * as path from 'path';
import * as fs from 'fs';

@Controller('documents')
@ApiTags('Documents')
@Permission('document')
@Resources('document')
export class DocumentController {
  private readonly logger = new Logger(DocumentController.name);

  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Subir un documento PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Datos para subir un documento',
    type: CreateDocumentDto,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'El archivo PDF a subir',
        },
        originalFilename: {
          type: 'string',
          description: 'Nombre original del documento',
        },
        category: {
          type: 'string',
          description: 'Categoría del documento',
        },
      },
    },
  })
  @Scopes('edit')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(
      `POST /documents - Subiendo documento: ${createDocumentDto.originalFilename}`,
    );
    return this.documentService.create(createDocumentDto, file);
  }

  @Get()
  @ApiBearerAuth()
  @Scopes('view')
  async findAll() {
    this.logger.log(`GET /documents - Obteniendo todos los documentos`);
    return this.documentService.findAll();
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Descargar documento por ID' })
  @ApiBearerAuth()
  @Scopes('view')
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    this.logger.log(`GET /documents/download/${id} - Descargando documento`);
    const { document, filePath } =
      await this.documentService.getDocumentFile(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalFilename}"`,
    );

    return res.sendFile(filePath);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /documents/${id} - Obteniendo documento`);
    return this.documentService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Scopes('view', 'edit')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    this.logger.log(`PUT /documents/${id} - Actualizando documento`);
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Scopes('view', 'edit')
  async delete(@Param('id') id: string) {
    this.logger.log(`DELETE /documents/${id} - Eliminando documento`);
    return this.documentService.delete(id);
  }
}
