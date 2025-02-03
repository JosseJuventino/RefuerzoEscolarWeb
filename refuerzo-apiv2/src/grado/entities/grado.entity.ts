import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Grados')
export class Grado {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;
}
