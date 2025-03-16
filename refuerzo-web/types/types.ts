/** Interfaces principales */

export interface PartialPostulant {
  _id?: string;
  nombre: string;
  imagen: string;
  direccion: string;
  telefono: string;
  email: string;
  grado: string;
  telefonoEncargado: string;
  programa: string;
  recomendador?: {
    nombreCompleto: string;
    email: string;
    image: string;
  };
  createdAt?: string;
}

export interface LoginAttempt {
  _id: string;
  userId: string;
  email: string;
  device: string;
  browser: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestPassResponse {
  statusCode: number;
  message: string;
}

export interface CompletePostulant {
  _id: string;
  nombre: string;
  imagen: string;
  direccion: string;
  telefono: string;
  email: string;
  telefonoEncargado: string;
  grado: string;
  programa: string;
  recomendador: {
    nombreCompleto: string;
    email: string;
    image: string;
  };
  createdAt: string;
}

export interface Rol {
  _id: string;
  nombre: string;
}

export interface Section {
  _id: string;
  nombre: string;
  imagen: string;
  aula: string;
  grado: string;
  alumnos: Alumno[];
}
export interface Alumno {
  _id: string;
  idUsuario: Usuario;
  section: Section;
}

export interface Usuario {
  _id: string;
  nombres: string;
  imagen: string;
  telefono: string;
  rol: Rol;
  email: string;
  password: string;
}

export interface UserEdited {
  _id: string;
  nombres: string;
  imagen: string;
  email: string;
}

export interface ActivateAccountRequirements {
  image?: string;
  telefono: string;
  password?: string;
}

export interface Recomendadores {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  image: string;
  postulantesCount: number;
  isActive: boolean;
  password: string;
}

export interface GetRecomendadoresResponse {
  statusCode: number;
  message: string;
  data: Recomendadores[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface GetPostulantesResponse {
  data: CompletePostulant[];
  totalDocuments: number;
  timestamp: string;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Estudiante {
  _id: string;
  cursosId: [];
  nombre: string;
  image: string;
  gradoId: string;

  user: {
    email: string;
    telefono: string;
  };

  grado: string;
}

export interface GetEstudiantesResponse {
  data: Estudiante[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
  statusCode: number;
  message: string;
}

export interface ColumnWithKey<T> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
}

export interface ColumnWithFunction<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export type Column<T> = ColumnWithKey<T> | ColumnWithFunction<T>;
export interface TableProps<T> {
  data: T[];
  loading: boolean;
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (itemId: string) => void;
  handleMove?: (item: T) => void;
  hasMove?: boolean;
  hasEdit?: boolean;
}

export interface AuthResponse {
  statusCode: number;
  message: string;
  data: {
    token: string;
    info: UserInfo;
  };
}

export interface UserInfo {
  nombreCompleto: string;
  email: string;
  image: string;
  isActive: boolean;
  role: string;
}

export interface Image {
  originalFilename: string;
  category: string;
  file: File;
}

export interface ImageResponse {
  message: string;
  data: {
    url: string;
    imageId: string;
    fileName: string;
  };
}

export interface Program {
  _id: string;
  nombre: string;
}

export interface PartialProgram {
  nombre: string;
}

export interface ProgramsResponse {
  statusCode: number;
  message: string;
  data: Program[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Grade {
  _id: string;
  nombre: string;
}

export interface PartialGrade {
  nombre: string;
}

export interface GradeResponse {
  statusCode: number;
  message: string;
  data: Grade[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Publicacion {
  id: number;
  descripcion: string;
  categoria: string;
  files: {
    id: string;
    originalFileName: string;
    url: string;
    tipo: string;
  }[];
  seccionId: string;
  titulo: string;
}

export interface Course {
  _id: string;
  nombre: string;
  gradoId: string;
  backgroundImage: string;
  encargados: {
    _id: string;
    nombre: string;
    image: string;
    email: string;
    telefono: string;
  }[];
  alumnos: {
    _id: string;
    nombre: string;
    image: string;
    email: string;
    telefono: string;
  }[];
  slug: string;
  createdAt: string;
  updatedAt: string;
  publicaciones?: Publicacion[];
}

export interface CourseResponse {
  statusCode: number;
  message: string;
  data: Course[] | Course;
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface FileNew {
  id: string;
  originalFileName: string;
  url: string;
  tipo: string;
  category: string;
  file: File;
  data: {
    url: string;
    documentId: string;
    fileName: string;
  };
}

export type FilePublicacion = Pick<
  FileNew,
  "id" | "originalFileName" | "url" | "tipo"
>;
export interface Publicacion {
  _id: string;
  createdAt: string;
  descripcion: string;
  categoria: string;
  files: FilePublicacion[];
  seccionId: string;
}

export interface Tutor {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  image: string;
  isActive: boolean;
  secciones: string[];
}

export interface TutorResponse {
  statusCode: number;
  message: string;
  data: Tutor[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Teacher {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  image: string;
  isActive: boolean;
  secciones: string[];
}

export interface TeacherResponse {
  statusCode: number;
  message: string;
  data: Teacher[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface Asistencia {
  _id: string;
  seccionId: string;
  alumnos: {
    id?: string;
    alumnoId: string;
    fecha: string;
    estado: string;
    nombre: string;
    imagen: string;
  }[];
  encargados: {
    id?: string;
    userId: string;
    fecha: string;
    estado: string;
    hora_inicio: string;
    hora_fin: string;
    nombre: string;
    imagen: string;
  }[];
}
export interface AsistenciaResponse {
  statusCode: number;
  message: string;
  data: Asistencia[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface FormValues {
    nombre: string;
    email: string;
    direccion: string;
    telefono: string;
    grado: string;
    programa: string;
    telefonoEncargado: string;
}
