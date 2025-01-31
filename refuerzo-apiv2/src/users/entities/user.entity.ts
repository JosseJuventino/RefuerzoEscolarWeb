import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  nombre: string;

  @Column()
  email: string;

  @Column()
  telefono: string;

  @Column()
  password: string;

  @Column()
  image: string;

  @Column()
  role: string;

  @Column()
  isActive: boolean;

  @Column()
  idDependingRole: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;


}
