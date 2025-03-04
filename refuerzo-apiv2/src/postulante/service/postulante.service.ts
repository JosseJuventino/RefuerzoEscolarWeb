import {
  BadRequestException,
  ConflictException,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreatePostulanteDto } from '../dto/create-postulante.dto';
import { ObjectId } from 'mongodb';
import { UpdatePostulanteDto } from '../dto/update-postulante.dto';
import { CrudHelper } from '../../common/helper/crud.helper';
import { Postulante } from '../entities/postulante.entity';
import { Repository, FindManyOptions } from 'typeorm';
import { GeneralResponseDto } from 'src/common/dto/general-response.dto';
import { GeneralResponseBuilder } from 'src/common/helper/general-response.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { buildPaginationAndFilterOptions } from 'src/common/helper/pagination.helper';
import { PaginationResponseBuilder } from 'src/common/helper/paginated-response.helper';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { User } from 'src/users/entities/user.entity';
import { PostulanteResponseDto } from '../dto/postulante-response.dto';
import { UsersService } from 'src/users/users.service';
import { CreateNewAlumnoDto } from 'src/users/dto/create-alumno.dto';
import { Grado } from 'src/grado/entities/grado.entity';
import { AlumnoService } from 'src/alumno/service/alumno.service';
import { CreateAlumnoDto } from 'src/alumno/dto/create-alumno.dto';

@Injectable()
export class PostulanteService {
  private readonly crudHelper: CrudHelper<Postulante>;
  private readonly userCrudHelper: CrudHelper<User>;
  private readonly gradoCrudHelper: CrudHelper<Grado>;
  constructor(
    @InjectRepository(Postulante)
    private readonly postulanteRepository: Repository<Postulante>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UsersService)) // <-- Añade forwardRef
    private readonly usersService: UsersService,
    @InjectRepository(Grado)
    private readonly gradoRepository: Repository<Grado>,
    @Inject(forwardRef(() => AlumnoService))
    private readonly alumnoService: AlumnoService,
  ) {
    this.crudHelper = new CrudHelper<Postulante>(
      this.postulanteRepository,
      'Postulantes',
    );
    this.userCrudHelper = new CrudHelper<User>(this.userRepository, 'Users');
    this.gradoCrudHelper = new CrudHelper<Grado>(
      this.gradoRepository,
      'Grados',
    );
  }
  async create(
    recomendadorId: ObjectId,
    createPostulanteDto: CreatePostulanteDto,
  ): Promise<GeneralResponseDto<Postulante>> {
    const findPostulante = await this.crudHelper.findByNameOrId(
      createPostulanteDto.nombre,
      false,
      false,
    );
    if (findPostulante) {
      throw new ConflictException(
        `Postulante with name ${createPostulanteDto.nombre} already exists`,
      );
    }

    const newPostulante = this.postulanteRepository.create({
      ...createPostulanteDto,
      recomendador: recomendadorId.toString(),
    });

    const savedPostulante = await this.postulanteRepository.save(newPostulante);

    // Crear un DTO para el usuario
    const createNewAlumnoDto: CreateNewAlumnoDto = {
      nombre: createPostulanteDto.nombre,
      email: createPostulanteDto.email, // Asumiendo que el contacto tiene un campo email
      image: createPostulanteDto.imagen,
      telefono: createPostulanteDto.telefono, // Asumiendo que el contacto tiene un campo telefono
      telefonoEncargado: createPostulanteDto.telefonoEncargado, // Asumiendo que el contacto tiene un campo telefonoEncargado
      idDependingRole: savedPostulante._id.toString(), // Usar el _id generado
      grado: createPostulanteDto.grado.toString(), // Asumiendo que el contacto tiene un campo grado
    };

    // Crear el usuario usando UsersService
    await this.usersService.createAlumno(createNewAlumnoDto);

    return new GeneralResponseBuilder<Postulante>()
      .setStatusCode(201)
      .setMessage('Postulante created successfully')
      .build();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const filter: any = {};
    // Agregar filtros adicionales si existen
    if (paginationQuery.filterBy && paginationQuery.filterValue) {
      filter[paginationQuery.filterBy] = {
        $regex: paginationQuery.filterValue,
        $options: 'i', // Insensible a mayúsculas
      };
    }

    // Determinar si se aplica paginación
    const applyPagination =
      paginationQuery.page !== undefined && paginationQuery.limit !== undefined;

    let results: Postulante[];
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

      // Obtener los resultados con paginación
      [results, total] =
        await this.postulanteRepository.findAndCount(queryOptions);

      totalPages = Math.ceil(total / paginationQuery.limit);

      // Validar si la página solicitada existe
      if (paginationQuery.page > totalPages && totalPages > 0) {
        throw new BadRequestException(
          `Page ${paginationQuery.page} does not exist. Total pages: ${totalPages}`,
        );
      }
    } else {
      // Si no hay paginación, obtener todos los registros
      results = await this.postulanteRepository.find({
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

    //Enriqueces los postulantes con la informacion del recomendador y grado
    const postulantesWithRecomendador = await Promise.all(
      results.map(async (postulante) => {
        const recomendador = await this.userCrudHelper.findByNameOrId(
          postulante.recomendador.toString(),
          false,
          false,
        );

        const grado = await this.gradoCrudHelper.findByNameOrId(
          postulante.grado.toString(),
          false,
          false,
        );

        return {
          _id: postulante._id,
          nombre: postulante.nombre,
          imagen: postulante.imagen,
          direccion: postulante.direccion,
          telefono: postulante.telefono,
          telefonoEncargado: postulante.telefonoEncargado,
          email: postulante.email,
          grado: grado.nombre,
          isUser: postulante.isUser,
          recomendador: {
            nombreCompleto: recomendador.nombre,
            email: recomendador.email,
            image: recomendador.image,
          },

          createdAt: postulante.createdAt,
          updatedAt: postulante.updatedAt,
        };
      }),
    );

    // Construir la respuesta paginada
    return new PaginationResponseBuilder()
      .setMessage(
        `Postulantes retrieved successfully. Total pages: ${totalPages}`,
      )
      .setData(postulantesWithRecomendador)
      .setSize(total)
      .setTotalPages(totalPages)
      .setPage(applyPagination ? paginationQuery.page : 1)
      .setLimit(applyPagination ? paginationQuery.limit : total) // Si no hay paginación, devolver todos los registros
      .build();
  }

  async findOne(
    id: string,
  ): Promise<GeneralResponseDto<PostulanteResponseDto>> {
    const findPostulante = await this.crudHelper.findByNameOrId(id);
    if (!findPostulante) {
      throw new BadRequestException(`Postulante with id ${id} not found`);
    }

    //Enriqueces el postulante con la informacion del recomendador
    const recomendador = await this.userCrudHelper.findByNameOrId(
      findPostulante.recomendador.toString(),
      false,
      false,
    );

    const grado = await this.userCrudHelper.findByNameOrId(
      findPostulante.grado.toString(),
      false,
      false,
    );

    const programa = await this.userCrudHelper.findByNameOrId(
      findPostulante.programa.toString(),
      false,
      false,
    );

    const postulanteWithRecomendador: PostulanteResponseDto = {
      _id: findPostulante._id,
      nombre: findPostulante.nombre,
      imagen: findPostulante.imagen,
      direccion: findPostulante.direccion,
      telefono: findPostulante.telefono,
      telefonoEncargado: findPostulante.telefonoEncargado,
      email: findPostulante.email,
      grado: grado
        ? {
            nombre: grado.nombre,
          }
        : {
            nombre: 'No grado',
          },
      programa: programa
        ? {
            nombre: programa.nombre,
          }
        : {
            nombre: 'No programa',
          },
      isUser: findPostulante.isUser,
      recomendador: recomendador
        ? {
            nombreCompleto: recomendador.nombre,
            email: recomendador.email,
            image: recomendador.image,
          }
        : {
            nombreCompleto: 'No recomendador',
            email: 'No recomendador',
            image: 'No recomendador',
          },
      createdAt: findPostulante.createdAt,
      updatedAt: findPostulante.updatedAt,
    };

    return new GeneralResponseBuilder<PostulanteResponseDto>()
      .setMessage('Postulante retrieved successfully')
      .setData(postulanteWithRecomendador)
      .build();
  }

  async update(
    id: string,
    updatePostulanteDto: UpdatePostulanteDto,
  ): Promise<GeneralResponseDto<Postulante>> {
    const Postulante = await this.crudHelper.findByNameOrId(id);

    await this.crudHelper.update(Postulante, updatePostulanteDto);
    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante updated successfully')
      .build();
  }

  async createNewAlumno(
    id: string,
    user_Id: string,
    nameUser: string,
    imageUser: string,
    emailUser: string,
    isUser: boolean,
  ): Promise<GeneralResponseDto<Postulante>> {
    const postulante = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.update(postulante, { isUser }); // Actualiza el campo isUser

    // Crear un nuevo alumno asociado al usuario
    const createNewAlumno: CreateAlumnoDto = {
      userId: user_Id,
      gradoId: postulante.grado.toString(),
      nombre: nameUser,
      image: imageUser,
      email: emailUser,
    };

    await this.alumnoService.create(createNewAlumno);

    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Alumno created and postulante updated successfully')
      .build();
  }

  async updateIsUser(
    id: string,
    isUser: boolean,
  ): Promise<GeneralResponseDto<Postulante>> {
    const postulante = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.update(postulante, { isUser }); // Actualiza el campo isUser

    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante updated successfully')
      .build();
  }

  async remove(id: string): Promise<GeneralResponseDto<Postulante>> {
    const Postulante = await this.crudHelper.findByNameOrId(id);
    await this.crudHelper.delete(Postulante, true);
    return new GeneralResponseBuilder<Postulante>()
      .setMessage('Postulante deleted successfully')
      .build();
  }
}
