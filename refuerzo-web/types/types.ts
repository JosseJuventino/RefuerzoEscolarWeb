/** Interfaces principales */

export interface Postulante {
  _id: string;
  nombre: string;
  imagen: string;
  direccion: string;
  telefono: string;
  email: string;
  grado: number;
  createdAt: string;
}

export interface Rol{
  _id: string;
  nombre: string;
}

export interface Section{
  _id: string;
  nombre: string;
  imagen: string;
  aula: string;
  grado: string;
  alumnos: Alumno[]

}
export interface Alumno{
  _id: string;
  idUsuario: Usuario;
  section: Section;
}

export interface Usuario{
  _id: string;
  nombres: string;
  apellidos: string;
  imagen: string;
  rol: Rol;
  email: string;
  password: string;
}

export interface Recomendadores{
  _id: string;
  nombre: string;
  contacto: {
    email: string;
    telefono: string;
  };
  imagen: string;
  isActive: boolean;
  password: string;
}

export interface GetRecomendadoresResponse{
  statusCode: number;
  message: string;
  data: Recomendadores[];
  size: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface GetPostulantesResponse {
  data: Postulante[];
  totalDocuments: number;
  timestamp: string;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Estudiante {
  _id: string;
  nombre: string;
  email: string;
  año: number;
  fechaEnvio: string;
}

export interface GetEstudiantesResponse {
  data: Postulante[];
  totalDocuments: number;
  timestamp: string;
  page: number;
  limit: number;
  totalPages: number;
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
  handleShare?: (item: T) => void;
  hasShare?: boolean;
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
}