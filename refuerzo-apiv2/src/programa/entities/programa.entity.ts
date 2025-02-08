import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Programas')
export class Programa {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;
}
