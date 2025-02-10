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
  Res, // Nuevo import
  NotFoundException, // Nuevo import
} from '@nestjs/common';
import { Response } from 'express'; // Nuevo import
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorators';
import { Permission } from 'src/common/decorators/permission.decorators';
import { Resources, Scopes } from 'nest_autorization';
import * as path from 'path'; // Nuevo import
import * as fs from 'fs'; // Nuevo import

@Controller('documents')
@ApiTags('Documents')
@Permission('documents')
@Resources('documents')
export class DocumentController {
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
  ) {
    return this.documentService.create(createDocumentDto, file);
  }

  @Public()
  @Get()
  async findAll() {
    return this.documentService.findAll();
  }

  @Get('download/:id')
  @Public()
  @ApiOperation({ summary: 'Descargar documento por ID' })
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    const { document, filePath } =
      await this.documentService.getDocumentFile(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.originalFilename}"`,
    );

    return res.sendFile(filePath);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Scopes('edit')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Scopes('edit')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentService.delete(id);
  }
}
