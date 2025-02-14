import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Publicacion } from '../../publicacion/entities/publicacion.entity';

@Entity('Secciones')
export class Seccion {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;

  @Column()
  gradoId: string;

  @Column()
  encargados: string[];

  @Column()
  alumnos: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
