import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ImageService {
  private readonly crudHelper: CrudHelper<Image>;
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    //Como agrego el configServices para obtener las variables de entorno
    private readonly configService: ConfigService,
  ) {
    this.crudHelper = new CrudHelper<Image>(this.imageRepository, 'Image');
  }

  async create(
    createImageDto: CreateImageDto,
    file,
    baseUrl: string,
  ): Promise<Object> {
    // Validar que se reciba un archivo
    if (!file) {
      throw new Error('El archivo es obligatorio');
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
      throw new Error(
        'Formato de archivo no soportado. Solo se permiten imágenes.',
      );
    }

    // Definir el directorio de almacenamiento
    const uploadsDir = path.resolve(
      __dirname,
      '..',
      '..',
      'uploads',
      createImageDto.category,
    );
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      // Extraer el nombre base del archivo (sin extensión)
      const baseFilename = createImageDto.originalFilename
        .split('.')[0]
        .replace(/ /g, '_');

      // Generar las rutas para el archivo WebP y optimizado
      const webpFilename = path.join(uploadsDir, `${baseFilename}.webp`);
      const optimizedFilename = path.join(
        uploadsDir,
        `optimized-${file.originalname}`,
      );

      // Convertir la imagen a WebP y guardarla
      await sharp(file.buffer).webp({ quality: 30 }).toFile(webpFilename);

      // Optimizar la imagen en su formato original
      await sharp(file.buffer)
        .toFormat('jpeg')
        .jpeg({ quality: 30 })
        .toFile(optimizedFilename);

      // Crear el registro en la base de datos
      const newImage = this.imageRepository.create({
        originalFilename: file.originalname,
        optimizedFilename: `optimized-${file.originalname}`,
        webpFilename: `${baseFilename}.webp`,
        category: createImageDto.category,
      });
      await this.imageRepository.save(newImage);
      return {
        message: 'Imagen cargada correctamente',
        data: {
          // Que la url sea dinamica y no estatica quiero que reconozca la baseurl del servidor
          url: `${this.configService.get('NEXT_PUBLIC_API_URLV2')}/uploads/${createImageDto.category}/${newImage.webpFilename}`,
        },
      };
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw new Error('Error al procesar y guardar la imagen.');
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

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    const image = await this.findOne(id);
    Object.assign(image, updateImageDto);
    return this.imageRepository.save(image);
  }

  async delete(id: string): Promise<void> {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    // Optionally delete associated files
    fs.unlinkSync(image.optimizedFilename);
    fs.unlinkSync(image.webpFilename);
  }
}
