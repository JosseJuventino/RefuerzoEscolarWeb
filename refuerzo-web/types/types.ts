/** Interfaces principales */
export interface Postulante {
  _id: string;
  nombre: string;
  email: string;
  año: number;
  fechaEnvio: string;
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
}
