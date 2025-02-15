import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Seccion } from '../../seccion/entities/seccion.entity';

@Entity('Publicaciones')
export class Publicacion {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  titulo: string;

  @Column()
  descripcion: string;

  @Column()
  categoria: string;

  @Column()
  files: any[];

  @Column()
  seccionId: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
