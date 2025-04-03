import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicacionDto } from '../dto/create-publicacion.dto';
import { ObjectId } from 'mongodb';
import { UpdatePublicacionDto } from '../dto/update-publicacion.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Publicacion } from '../entities/publicacion.entity';
import { Repository, FindManyOptions, In } from 'typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { Role } from 'src/roles/entities/role.entity';
import { Document } from 'src/document/entities/document.entity';
import { Image } from 'src/images/entities/image.entity';
import { ImageService } from 'src/images/images.service';
import { DocumentService } from 'src/document/document.service';

@Injectable()
export class PublicacionService {
  private readonly crudHelper: CrudHelper<Publicacion>;
  private readonly roleCrudHelper: CrudHelper<Role>;

  constructor(
    @InjectRepository(Publicacion)
    private readonly PublicacionRepository: Repository<Publicacion>,
    @InjectRepository(Role)
    private readonly RoleRepository: Repository<Role>,
    private readonly imageService: ImageService, // Inyectar ImageService
    private readonly documentService: DocumentService, // Inyectar DocumentService
  ) {
    this.crudHelper = new CrudHelper<Publicacion>(
      this.PublicacionRepository,
      'Publicaciones',
    );
    this.roleCrudHelper = new CrudHelper<Role>(this.RoleRepository, 'Roles');
  }

  private checkForDuplicateFiles(
    files: Array<{ id: string; url: string; originalFileName: string }>,
  ) {
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();

    for (const file of files) {
      if (seenIds.has(file.id)) {
        throw new BadRequestException(
          `El archivo ${file.originalFileName} está duplicado.`,
        );
      }
      seenIds.add(file.id);

      if (seenUrls.has(file.url)) {
        throw new BadRequestException(
          `El archivo ${file.originalFileName} está duplicado.`,
        );
      }
      seenUrls.add(file.url);
    }
  }

  async create(
    userName: string,
    userId: string,
    createPublicacionDto: CreatePublicacionDto,
  ) {
    const categorias = ['anuncio', 'material de apoyo'];

    if (!categorias.includes(createPublicacionDto.categoria)) {
      throw new BadRequestException(
        `Categoria ${createPublicacionDto.categoria} is not valid`,
      );
    }

    for (const file of createPublicacionDto.files) {
      if (file.tipo !== 'imagen' && file.tipo !== 'documento') {
        throw new BadRequestException(
          `Tipo de archivo inválido: ${file.tipo}. Solo se permiten 'imagen' o 'documento'.`,
        );
      }
    }

    this.checkForDuplicateFiles(createPublicacionDto.files);

    // Validar máximo 5 archivos
    if (createPublicacionDto.files.length > 5) {
      throw new BadRequestException('No se pueden adjuntar más de 5 archivos');
    }

    let newTitle: string;
    if (createPublicacionDto.categoria === 'anuncio') {
      newTitle = `${userName} publicó un nuevo anuncio`;
    } else {
      newTitle = `${userName} publicó un nuevo material de apoyo`;
    }

    const newPublicacion = this.PublicacionRepository.create({
      titulo: newTitle,
      descripcion: createPublicacionDto.descripcion,
      categoria: createPublicacionDto.categoria,
      files: createPublicacionDto.files,
      seccionId: createPublicacionDto.seccionId,
      createdBy: userId,
    });

    const savedPublicacion =
      await this.PublicacionRepository.save(newPublicacion);

    return {
      statusCode: 201,
      message: 'Publicacion created successfully',
      data: savedPublicacion,
    };
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const filter: any = {};
    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i', // Insensible a mayúsculas
      };
    }

    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: Publicacion[];
    let total: number;
    let totalPages: number;

    if (applyPagination) {
      const queryOptions = {
        skip: (paginationQuery.page - 1) * paginationQuery.limit,
        take: paginationQuery.limit,
        where: filter,
        order:
          paginationQuery.orderedBy && paginationQuery.sort
            ? {
                [paginationQuery.orderedBy]:
                  paginationQuery.sort.toUpperCase() as 'ASC' | 'DESC',
              }
            : undefined,
        withDeleted: paginationQuery.includeDeleted,
      };

      [results, total] =
        await this.PublicacionRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      results = await this.PublicacionRepository.find({
        where: filter,
        order:
          paginationQuery.orderedBy && paginationQuery.sort
            ? {
                [paginationQuery.orderedBy]:
                  paginationQuery.sort.toUpperCase() as 'ASC' | 'DESC',
              }
            : undefined,
        withDeleted: paginationQuery.includeDeleted,
      });

      total = results.length;
      totalPages = 1;
    }

    return new PaginationResponseBuilder()
      .setMessage(
        `Publicaciones retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(results)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total)
      .build();
  }

  async findOne(id: string): Promise<GeneralResponseDto<Publicacion>> {
    const findPublicacion = await this.crudHelper.findByNameOrId(id);
    if (!findPublicacion) {
      throw new BadRequestException(`Publicacion with id ${id} not found`);
    }
    return new GeneralResponseBuilder<Publicacion>()
      .setMessage('Publicacion retrieved successfully')
      .setData(findPublicacion)
      .build();
  }

  async update(
    id: string,
    userName: string,
    userId: string,
    updatePublicacionDto: UpdatePublicacionDto,
  ): Promise<GeneralResponseDto<Publicacion>> {
    const publicacion = await this.crudHelper.findByNameOrId(id);

    let newTitle: string;

    if (updatePublicacionDto.categoria) {
      const categorias = ['anuncio', 'material de apoyo'];

      if (!categorias.includes(updatePublicacionDto.categoria)) {
        throw new BadRequestException(
          `Categoria ${updatePublicacionDto.categoria} is not valid`,
        );
      }

      if (updatePublicacionDto.categoria === 'anuncio') {
        newTitle = `${userName} publicó un nuevo anuncio`;
      } else {
        newTitle = `${userName} publicó un nuevo material de apoyo`;
      }
    }

    const existingFiles = publicacion.files;
    const newFiles = updatePublicacionDto.files ?? publicacion.files;

    if (updatePublicacionDto.files) {
      this.checkForDuplicateFiles(updatePublicacionDto.files);
    }

    // Validar máximo 5 archivos al actualizar
    if (newFiles.length > 5) {
      throw new BadRequestException('No se pueden adjuntar más de 5 archivos');
    }

    const filesToRemove = existingFiles.filter(
      (existingFile) =>
        !newFiles.some((newFile) => newFile.id === existingFile.id),
    );

    for (const file of filesToRemove) {
      if (file.tipo === 'imagen') {
        await this.imageService.delete(file.id);
      } else if (file.tipo === 'documento') {
        await this.documentService.delete(file.id);
      }
    }

    publicacion.titulo = newTitle || publicacion.titulo;
    publicacion.categoria =
      updatePublicacionDto.categoria || publicacion.categoria;
    publicacion.descripcion =
      updatePublicacionDto.descripcion || publicacion.descripcion;
    publicacion.files = newFiles;
    publicacion.updatedAt = new Date();

    await this.PublicacionRepository.save(publicacion);

    return new GeneralResponseBuilder<Publicacion>()
      .setMessage('Publicacion updated successfully')
      .setData(publicacion)
      .build();
  }

  async remove(
    id: string,
    roleId: string,
  ): Promise<GeneralResponseDto<Publicacion>> {
    const rol = await this.roleCrudHelper.findByNameOrId(roleId);

    if (!rol) {
      throw new BadRequestException(`Role with id ${roleId} not found`);
    }

    if (rol.name !== 'admin' && rol.name !== 'profesor') {
      throw new ConflictException(
        `Role ${rol.name} does not have permission to delete Publicacion`,
      );
    }

    const publicacion = await this.crudHelper.findByNameOrId(id);

    // Eliminar todos los archivos asociados
    for (const file of publicacion.files) {
      if (file.tipo === 'imagen') {
        await this.imageService.delete(file.id);
      } else if (file.tipo === 'documento') {
        await this.documentService.delete(file.id);
      }
    }

    await this.crudHelper.delete(publicacion, true);

    return new GeneralResponseBuilder<Publicacion>()
      .setMessage('Publicacion deleted successfully')
      .build();
  }

  async deleteBySeccionId(seccionId: string): Promise<void> {
    const publicaciones = await this.PublicacionRepository.find({
      where: { seccionId },
    });

    for (const publicacion of publicaciones) {
      // Eliminar archivos asociados
      for (const file of publicacion.files) {
        if (file.tipo === 'imagen') {
          await this.imageService.delete(file.id);
        } else if (file.tipo === 'documento') {
          await this.documentService.delete(file.id);
        }
      }
      // Eliminar la publicación
      await this.PublicacionRepository.delete(publicacion._id);
    }
  }
}
