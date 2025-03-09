// document.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as fs from 'fs';
import { CrudHelper } from 'src/common/helper/crud.helper';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
  private readonly crudHelper: CrudHelper<Document>;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly configService: ConfigService,
  ) {
    this.crudHelper = new CrudHelper<Document>(
      this.documentRepository,
      'Document',
    );
  }

  // Modifica el método create en DocumentService
  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
  ): Promise<Object> {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio');
    }

    // Validar tamaño máximo del archivo (5 MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB en bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        'El tamaño del archivo no puede exceder los 5 MB',
      );
    }

    // Validar que sea PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Formato de archivo no soportado. Solo se permiten PDF.',
      );
    }

    const uploadsDir = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'documents',
      createDocumentDto.category,
    );

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      // Sanitizar el nombre del archivo
      let originalFilename = createDocumentDto.originalFilename;

      // Asegurar que tenga extensión .pdf
      if (!originalFilename.toLowerCase().endsWith('.pdf')) {
        originalFilename += '.pdf';
      }

      // Generar nombre único para el archivo almacenado
      const storedFilename = `${uuidv4()}.pdf`;
      const filePath = path.join(uploadsDir, storedFilename);

      // Guardar el archivo
      fs.writeFileSync(filePath, file.buffer);

      const DocumentUrl = `${this.configService.get('NEXT_PUBLIC_API_URLV2')}/uploads/documents/${createDocumentDto.category}/${storedFilename}`;

      // Crear registro en base de datos
      const newDocument = this.documentRepository.create({
        originalFilename: originalFilename, // Usamos el nombre personalizado
        storedFilename: storedFilename,
        category: createDocumentDto.category,
        url: DocumentUrl,
      });

      await this.documentRepository.save(newDocument);

      return {
        message: 'Documento subido correctamente',
        data: {
          url: DocumentUrl,
          documentId: newDocument._id.toString(),
          fileName: originalFilename, // Devolvemos el nombre formateado
        },
      };
    } catch (error) {
      console.error('Error al guardar el documento:', error);
      throw new BadRequestException(
        'Error al procesar y guardar el documento.',
      );
    }
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.crudHelper.findByNameOrId(id);
    if (!document) throw new NotFoundException('Documento no encontrado');
    return document;
  }

  // Añade este nuevo método en la clase DocumentService
  async getDocumentFile(
    id: string,
  ): Promise<{ document: Document; filePath: string }> {
    const document = await this.findOne(id);
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'documents',
      document.category,
      document.storedFilename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    return { document, filePath };
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async delete(id: string): Promise<string> {
    const document = await this.findOne(id);

    // Eliminar archivo físico
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'documents',
      document.category,
      document.storedFilename,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.documentRepository.remove(document);

    return 'Documento eliminado correctamente';
  }
}
