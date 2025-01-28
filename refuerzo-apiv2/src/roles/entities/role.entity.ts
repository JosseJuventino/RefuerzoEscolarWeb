import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export class PermisionOptions {
  view: boolean;
  edit: boolean;
}

export class Page {
  postulantes: PermisionOptions;
  usuarios: PermisionOptions;
  secciones: PermisionOptions;
  alumnos: PermisionOptions;
  recomendadores: PermisionOptions;
  roles: PermisionOptions;
}

@Entity('Roles')
export class Role {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  pages: Page;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
