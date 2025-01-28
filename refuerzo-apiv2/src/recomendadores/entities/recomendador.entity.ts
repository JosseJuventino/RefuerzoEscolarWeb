import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export class Contacto {
  email: string;
  telefono: string;
}

@Entity('Recomendadores')
export class Recomendador {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;

  @Column()
  contacto: Contacto;

  @Column()
  imagen: string;

  @Column()
  isActive: boolean;
}
