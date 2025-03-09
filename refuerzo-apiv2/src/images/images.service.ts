import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { CrudHelper } from 'src/common/helper/crud.helper';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  private readonly crudHelper: CrudHelper<Image>;

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
  ) {
    this.crudHelper = new CrudHelper<Image>(this.imageRepository, 'Image');
  }

  async create(
    createImageDto: CreateImageDto,
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

    // Validar el tipo de archivo para evitar errores en formatos no soportados
    const supportedFormats = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/tiff',
    ];
    if (!supportedFormats.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de archivo no soportado. Solo se permiten imágenes.',
      );
    }

    // Definir el directorio de almacenamiento
    const uploadsDir = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'images',
      createImageDto.category,
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      // Sanitizar el nombre del archivo
      let originalFilename = createImageDto.originalFilename;

      // Generar nombre único para el archivo almacenado, asegurando que termine en .webp
      const storedFilename = `${uuidv4()}.webp`; // Siempre termina en .webp
      const filePath = path.join(uploadsDir, storedFilename);

      // Convertir la imagen a WebP y guardarla
      await sharp(file.buffer).webp({ quality: 30 }).toFile(filePath);

      const imageUrl = `${this.configService.get('NEXT_PUBLIC_API_URLV2')}/uploads/images/${createImageDto.category}/${storedFilename}`;

      // Crear el registro en la base de datos
      const newImage = this.imageRepository.create({
        originalFilename: originalFilename,
        storedFilename: storedFilename,
        category: createImageDto.category,
        url: imageUrl,
      });

      await this.imageRepository.save(newImage);

      return {
        message: 'Imagen cargada correctamente',
        data: {
          url: imageUrl,
          imageId: newImage._id.toString(),
          fileName: originalFilename,
        },
      };
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw new BadRequestException('Error al procesar y guardar la imagen.');
    }
  }

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async findOne(id: string): Promise<Image> {
    const image = await this.crudHelper.findByNameOrId(id);
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async getImageFile(id: string): Promise<{ image: Image; filePath: string }> {
    const image = await this.findOne(id);
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'images',
      image.category,
      image.storedFilename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    return { image, filePath };
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return this.imageRepository.save(image);
  }

  async delete(id: string): Promise<string> {
    const image = await this.findOne(id);

    // Eliminar archivo físico
    const filePath = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      'images',
      image.category,
      image.storedFilename,
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.imageRepository.remove(image);

    return 'Imagen eliminada correctamente';
  }
}
