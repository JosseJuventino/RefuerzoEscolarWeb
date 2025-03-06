import { ObjectId } from 'mongodb';
import {
  Collection,
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Alumnos')
export class Alumno {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;

  @Column()
  image: string;

  @Column()
  email: string;

  @Column()
  userId: string;

  @Column()
  gradoId: string;

  @Column()
  telefonoEncargado: string;
}
