export interface Postulante {
    _id: string;
    nombre: string;
    email: string;
    año: number;
    estado: string;
    fechaEnvio: string;
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